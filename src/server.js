import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import carsRouter from "./routes/cars.js";
import { initDb } from "./db/pool.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static serving for uploads
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/cars", carsRouter);

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

// Start server
app.listen(port, async () => {
	console.log(`Server listening on http://localhost:${port}`);
	const ok = await initDb();
	if (ok) {
		console.log("Database initialized (Cars table ready)");
	} else {
		console.warn("Database not available. API will error on DB access until configured.");
	}
});

