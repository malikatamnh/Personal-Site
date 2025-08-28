import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { pool } from '../db/pool.js';

const router = express.Router();

router.use(requireAdmin);

// Users table: list, delete, block/unblock
router.get('/users', async (_req, res) => {
	try {
		const { rows } = await pool.query('SELECT id, name, email, role, blocked, created_at FROM users ORDER BY created_at DESC');
		res.json(rows);
	} catch (e) {
		res.status(500).json({ error: 'Failed to load users' });
	}
});

router.delete('/users/:id', async (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
	try {
		await pool.query('DELETE FROM users WHERE id = $1', [id]);
		res.status(204).send();
	} catch (e) {
		res.status(500).json({ error: 'Failed to delete user' });
	}
});

router.post('/users/:id/block', async (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
	try {
		await pool.query('UPDATE users SET blocked = TRUE WHERE id = $1', [id]);
		res.status(204).send();
	} catch (e) {
		res.status(500).json({ error: 'Failed to block user' });
	}
});

router.post('/users/:id/unblock', async (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
	try {
		await pool.query('UPDATE users SET blocked = FALSE WHERE id = $1', [id]);
		res.status(204).send();
	} catch (e) {
		res.status(500).json({ error: 'Failed to unblock user' });
	}
});

// Cars table: list, delete
router.get('/cars', async (_req, res) => {
	try {
		const { rows } = await pool.query('SELECT id, make, model, year, price, km, city, image, created_at FROM cars ORDER BY created_at DESC');
		res.json(rows);
	} catch (e) {
		res.status(500).json({ error: 'Failed to load cars' });
	}
});

router.delete('/cars/:id', async (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
	try {
		await pool.query('DELETE FROM cars WHERE id = $1', [id]);
		res.status(204).send();
	} catch (e) {
		res.status(500).json({ error: 'Failed to delete car' });
	}
});

// Stats: new cars per day (last 30 days)
router.get('/stats/cars-per-day', async (_req, res) => {
	try {
		const { rows } = await pool.query(`
			SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
			       COUNT(*) AS count
			FROM cars
			WHERE created_at > NOW() - INTERVAL '30 days'
			GROUP BY 1
			ORDER BY 1
		`);
		res.json(rows);
	} catch (e) {
		res.status(500).json({ error: 'Failed to load stats' });
	}
});

export default router;

