import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { pool } from "../db.js";
import { requireAuth, signToken, type AuthRequest } from "../middleware/auth.js";
import { sendEmail, buildResetEmailHtml } from "../lib/email.js";

const router = Router();

async function ensureResetTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token       TEXT NOT NULL UNIQUE,
      expires_at  TIMESTAMPTZ NOT NULL,
      used        BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}
ensureResetTable().catch(console.error);

router.post("/register", async (req, res) => {
  const { email, password, full_name, role: requestedRole } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const isMentorSignup = requestedRole === "mentor";

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, bio, avatar_url",
      [email.toLowerCase(), password_hash, full_name || null]
    );
    const user = rows[0];

    const assignedRole = isMentorSignup ? "mentor" : "student";
    await pool.query(
      "INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [user.id, assignedRole]
    );

    if (isMentorSignup) {
      const name = full_name || email.split("@")[0];
      await pool.query(
        `INSERT INTO mentors (user_id, name, title, bio, published) VALUES ($1, $2, '', '', false)`,
        [user.id, name]
      );
    }

    const token = signToken({ id: user.id, email: user.email, role: assignedRole });
    return res.json({ token, user: { ...user, role: assignedRole } });
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
    if (user.is_blocked) return res.status(403).json({ error: "Your account has been suspended. Please contact support." });

    const { rows: roleRows } = await pool.query(
      "SELECT role FROM user_roles WHERE user_id = $1 ORDER BY CASE role WHEN 'admin' THEN 0 WHEN 'instructor' THEN 1 WHEN 'mentor' THEN 2 ELSE 3 END LIMIT 1",
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

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const { rows } = await pool.query(
      "SELECT id, full_name, email FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    const user = rows[0];

    await pool.query(
      "DELETE FROM password_reset_tokens WHERE user_id = $1 AND used = false",
      [user.id]
    );

    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, rawToken, expiresAt]
    );

    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your HTB Consult Academy password",
      html: buildResetEmailHtml(resetUrl, user.full_name || ""),
      text: `Hi ${user.full_name || ""},\n\nClick this link to reset your password (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.\n\nHTB Consult Academy`,
    });

    return res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err: any) {
    console.error("[forgot-password]", err);
    return res.status(500).json({ error: "Failed to process request" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Token and new password are required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.user_id, t.expires_at, t.used, u.email
       FROM password_reset_tokens t
       JOIN users u ON u.id = t.user_id
       WHERE t.token = $1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const record = rows[0];

    if (record.used) {
      return res.status(400).json({ error: "This reset link has already been used" });
    }

    if (new Date(record.expires_at) < new Date()) {
      await pool.query("DELETE FROM password_reset_tokens WHERE id = $1", [record.id]);
      return res.status(400).json({ error: "This reset link has expired. Please request a new one." });
    }

    const password_hash = await bcrypt.hash(password, 12);

    await pool.query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2", [
      password_hash,
      record.user_id,
    ]);

    await pool.query("UPDATE password_reset_tokens SET used = true WHERE id = $1", [record.id]);

    return res.json({ message: "Password updated successfully. You can now log in." });
  } catch (err: any) {
    console.error("[reset-password]", err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;
