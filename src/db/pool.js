import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
	host: process.env.PGHOST || process.env.PG_HOST || "localhost",
	port: Number(process.env.PGPORT || process.env.PG_PORT || 5432),
	user: process.env.PGUSER || process.env.PG_USER || "postgres",
	password: process.env.PGPASSWORD || process.env.PG_PASSWORD || "postgres",
	database: process.env.PGDATABASE || process.env.PG_DATABASE || "cars_db",
	ssl: !!(process.env.PGSSL === "true" || process.env.PG_SSL === "true"),
	max: Number(process.env.PGPOOL_MAX || 10),
	idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000)
});

export async function initDb() {
	// Create Cars table if it does not exist
	const createTableSql = `
		CREATE TABLE IF NOT EXISTS cars (
			id SERIAL PRIMARY KEY,
			make TEXT NOT NULL,
			model TEXT NOT NULL,
			year INTEGER NOT NULL,
			price NUMERIC(12,2) NOT NULL,
			km INTEGER NOT NULL,
			city TEXT NOT NULL,
			image TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);
	`;

	try {
		await pool.query(createTableSql);
		return true;
	} catch (error) {
		// Log and allow server to continue starting to enable dev experience without DB
		console.error("[DB] Initialization failed:", error.message);
		return false;
	}
}

