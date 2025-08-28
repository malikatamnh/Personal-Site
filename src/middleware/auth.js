import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";

export function generateJwt(userId) {
	const secret = process.env.JWT_SECRET || "dev_secret_change_me";
	const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
	return jwt.sign({ userId }, secret, { expiresIn });
}

export function requireAuth(req, res, next) {
	try {
		const header = req.get("authorization") || req.get("Authorization");
		if (!header || !header.toLowerCase().startsWith("bearer ")) {
			return res.status(401).json({ error: "Missing Authorization header" });
		}
		const token = header.slice(7).trim();
		const secret = process.env.JWT_SECRET || "dev_secret_change_me";
		const decoded = jwt.verify(token, secret);
		req.userId = decoded.userId;
		return next();
	} catch (_err) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}

export function requireAdmin(req, res, next) {
	try {
		const header = req.get("authorization") || req.get("Authorization");
		if (!header || !header.toLowerCase().startsWith("bearer ")) {
			return res.status(401).json({ error: "Missing Authorization header" });
		}
		const token = header.slice(7).trim();
		const secret = process.env.JWT_SECRET || "dev_secret_change_me";
		const decoded = jwt.verify(token, secret);
		req.userId = decoded.userId;
		// Fetch role
		pool.query('SELECT role, blocked FROM users WHERE id = $1', [req.userId])
			.then(({ rows }) => {
				if (rows.length === 0) return res.status(401).json({ error: 'Invalid token' });
				const { role, blocked } = rows[0];
				if (blocked) return res.status(403).json({ error: 'User blocked' });
				if (role !== 'admin') return res.status(403).json({ error: 'Admin only' });
				return next();
			})
			.catch(() => res.status(500).json({ error: 'Auth check failed' }));
	} catch (_err) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}

