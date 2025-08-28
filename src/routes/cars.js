import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import Joi from "joi";
import { pool } from "../db/pool.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage and filters
const storage = multer.diskStorage({
	destination: function (_req, _file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (_req, file, cb) {
		const ext = path.extname(file.originalname);
		const base = path.basename(file.originalname, ext)
			.replace(/[^a-zA-Z0-9_-]/g, "_")
			.slice(0, 50);
		cb(null, `${Date.now()}_${base}${ext.toLowerCase()}`);
	}
});

function fileFilter(_req, file, cb) {
	if (/^image\//.test(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Only image uploads are allowed"));
	}
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Validation schema
const carSchema = Joi.object({
	make: Joi.string().trim().min(1).required(),
	model: Joi.string().trim().min(1).required(),
	year: Joi.number().integer().min(1900).max(2100).required(),
	price: Joi.number().precision(2).positive().required(),
	km: Joi.number().integer().min(0).required(),
	city: Joi.string().trim().min(1).required()
});

function toAbsoluteImageUrl(req, imagePath) {
	if (!imagePath) return null;
	// Ensure the path starts with /uploads
	const normalized = imagePath.startsWith("/uploads") ? imagePath : `/uploads/${path.basename(imagePath)}`;
	return `${req.protocol}://${req.get("host")}${normalized}`;
}

// GET /cars – list all cars
router.get("/", async (req, res) => {
	try {
		const { rows } = await pool.query(
			`SELECT id, make, model, year, price, km, city, image, created_at FROM cars ORDER BY created_at DESC`
		);
		const data = rows.map((row) => ({
			...row,
			image: toAbsoluteImageUrl(req, row.image)
		}));
		res.json(data);
	} catch (error) {
		console.error("[GET /cars]", error);
		res.status(500).json({ error: "Failed to fetch cars" });
	}
});

// POST /cars – create new car, image via multipart/form-data field name "image"
router.post("/", upload.single("image"), async (req, res) => {
	try {
		// Coerce numeric strings to numbers before validation
		const body = {
			make: req.body.make,
			model: req.body.model,
			year: req.body.year !== undefined ? Number(req.body.year) : undefined,
			price: req.body.price !== undefined ? Number(req.body.price) : undefined,
			km: req.body.km !== undefined ? Number(req.body.km) : undefined,
			city: req.body.city
		};

		const { value, error } = carSchema.validate(body, { convert: true, abortEarly: false });
		if (error) {
			return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });
		}

		let imagePath = null;
		if (req.file) {
			imagePath = `/uploads/${req.file.filename}`;
		}

		const insertSql = `
			INSERT INTO cars (make, model, year, price, km, city, image)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id, make, model, year, price, km, city, image, created_at
		`;
		const params = [
			value.make,
			value.model,
			value.year,
			value.price,
			value.km,
			value.city,
			imagePath
		];

		const { rows } = await pool.query(insertSql, params);
		const created = rows[0];
		created.image = toAbsoluteImageUrl(req, created.image);
		res.status(201).json(created);
	} catch (error) {
		console.error("[POST /cars]", error);
		res.status(500).json({ error: "Failed to create car" });
	}
});

// GET /cars/:id – fetch car by id
router.get("/:id", async (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
	try {
		const { rows } = await pool.query(
			`SELECT id, make, model, year, price, km, city, image, created_at FROM cars WHERE id = $1`,
			[id]
		);
		if (rows.length === 0) return res.status(404).json({ error: "Not found" });
		const car = rows[0];
		car.image = toAbsoluteImageUrl(req, car.image);
		res.json(car);
	} catch (error) {
		console.error("[GET /cars/:id]", error);
		res.status(500).json({ error: "Failed to fetch car" });
	}
});

// DELETE /cars/:id – delete car (and image file if present)
router.delete("/:id", async (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });
	try {
		// Retrieve image path before deletion
		const { rows } = await pool.query(`SELECT image FROM cars WHERE id = $1`, [id]);
		if (rows.length === 0) return res.status(404).json({ error: "Not found" });
		const imagePath = rows[0].image;

		await pool.query(`DELETE FROM cars WHERE id = $1`, [id]);

		if (imagePath) {
			const absolute = path.join(uploadsDir, path.basename(imagePath));
			fs.promises.unlink(absolute).catch(() => {});
		}

		res.status(204).send();
	} catch (error) {
		console.error("[DELETE /cars/:id]", error);
		res.status(500).json({ error: "Failed to delete car" });
	}
});

export default router;

