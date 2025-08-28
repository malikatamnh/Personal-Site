import jwt from "jsonwebtoken";

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

