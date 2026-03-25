import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const [courses, mentors, enrollments, users] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM courses"),
      pool.query("SELECT COUNT(*) FROM mentors"),
      pool.query("SELECT COUNT(*) FROM enrollments"),
      pool.query("SELECT COUNT(*) FROM users"),
    ]);
    return res.json({
      courses: parseInt(courses.rows[0].count),
      mentors: parseInt(mentors.rows[0].count),
      enrollments: parseInt(enrollments.rows[0].count),
      users: parseInt(users.rows[0].count),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const { rows: users } = await pool.query(
      "SELECT id, email, full_name, bio, avatar_url, created_at FROM users ORDER BY created_at DESC"
    );
    const { rows: roles } = await pool.query("SELECT user_id, role FROM user_roles");
    const usersWithRoles = users.map((u) => ({
      ...u,
      roles: roles.filter((r) => r.user_id === u.id).map((r) => r.role),
    }));
    return res.json(usersWithRoles);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.patch("/users/:id/role", requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: "role required" });
  try {
    await pool.query(
      "INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO NOTHING",
      [req.params.id, role]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update role" });
  }
});

router.get("/enrollments", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.email, u.full_name, c.title AS course_title
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       JOIN courses c ON c.id = e.course_id
       ORDER BY e.enrolled_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

export default router;
