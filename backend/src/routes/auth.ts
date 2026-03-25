import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { requireAuth, signToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, bio, avatar_url",
      [email.toLowerCase(), password_hash, full_name || null]
    );
    const user = rows[0];

    await pool.query(
      "INSERT INTO user_roles (user_id, role) VALUES ($1, 'student') ON CONFLICT DO NOTHING",
      [user.id]
    );

    const token = signToken({ id: user.id, email: user.email, role: "student" });
    return res.json({ token, user: { ...user, role: "student" } });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const { rows: userRows } = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    if (userRows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = userRows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const { rows: roleRows } = await pool.query(
      "SELECT role FROM user_roles WHERE user_id = $1 ORDER BY CASE role WHEN 'admin' THEN 0 WHEN 'instructor' THEN 1 ELSE 2 END LIMIT 1",
      [user.id]
    );
    const role = roleRows[0]?.role || "student";

    const token = signToken({ id: user.id, email: user.email, role });
    return res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, bio: user.bio, avatar_url: user.avatar_url, role },
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query("SELECT id, email, full_name, bio, avatar_url FROM users WHERE id = $1", [req.user!.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    return res.json({ ...rows[0], role: req.user!.role });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.patch("/profile", requireAuth, async (req: AuthRequest, res) => {
  const { full_name, bio, avatar_url } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE users SET full_name = $1, bio = $2, avatar_url = $3, updated_at = now() WHERE id = $4 RETURNING id, email, full_name, bio, avatar_url",
      [full_name || null, bio || null, avatar_url || null, req.user!.id]
    );
    return res.json({ ...rows[0], role: req.user!.role });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
