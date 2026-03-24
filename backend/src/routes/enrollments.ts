import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, row_to_json(c) AS courses
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user!.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { course_id } = req.body;
  if (!course_id) return res.status(400).json({ error: "course_id required" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING RETURNING *`,
      [req.user!.id, course_id]
    );
    return res.json(rows[0] || { user_id: req.user!.id, course_id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to enroll" });
  }
});

export default router;
