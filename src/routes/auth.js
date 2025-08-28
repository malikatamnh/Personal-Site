import express from "express";
import Joi from "joi";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { generateJwt, requireAuth } from "../middleware/auth.js";

const router = express.Router();

const registerSchema = Joi.object({
	name: Joi.string().trim().min(2).max(100).required(),
	email: Joi.string().trim().lowercase().email().required(),
	password: Joi.string().min(8).max(128).required()
});

const loginSchema = Joi.object({
	email: Joi.string().trim().lowercase().email().required(),
	password: Joi.string().min(8).max(128).required()
});

// POST /auth/register
router.post("/register", async (req, res) => {
	try {
		const { value, error } = registerSchema.validate(req.body, { abortEarly: false });
		if (error) {
			return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });
		}

		const normalizedEmail = value.email;
		const passwordHash = await bcrypt.hash(value.password, 10);

		const insertSql = `
			INSERT INTO users (name, email, password)
			VALUES ($1, $2, $3)
			RETURNING id, name, email, created_at
		`;
		try {
			const { rows } = await pool.query(insertSql, [value.name, normalizedEmail, passwordHash]);
			const user = rows[0];
			return res.status(201).json(user);
		} catch (e) {
			if (e && e.code === "23505") {
				return res.status(409).json({ error: "Email already registered" });
			}
			throw e;
		}
	} catch (err) {
		console.error("[POST /auth/register]", err);
		return res.status(500).json({ error: "Registration failed" });
	}
});

// POST /auth/login
router.post("/login", async (req, res) => {
	try {
		const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
		if (error) {
			return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });
		}

		const { email, password } = value;
		const { rows } = await pool.query(`SELECT id, name, email, password, created_at FROM users WHERE email = $1`, [email]);
		if (rows.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" });
		}
		const user = rows[0];
		const ok = await bcrypt.compare(password, user.password);
		if (!ok) {
			return res.status(401).json({ error: "Invalid credentials" });
		}
		const token = generateJwt(user.id);
		return res.json({
			token,
			user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at }
		});
	} catch (err) {
		console.error("[POST /auth/login]", err);
		return res.status(500).json({ error: "Login failed" });
	}
});

// GET /auth/profile
router.get("/profile", requireAuth, async (req, res) => {
	try {
		const { rows } = await pool.query(`SELECT id, name, email, created_at FROM users WHERE id = $1`, [req.userId]);
		if (rows.length === 0) return res.status(404).json({ error: "User not found" });
		return res.json(rows[0]);
	} catch (err) {
		console.error("[GET /auth/profile]", err);
		return res.status(500).json({ error: "Failed to load profile" });
	}
});

export default router;

