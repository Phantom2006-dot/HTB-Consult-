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

router.patch("/:course_id/progress", requireAuth, async (req: AuthRequest, res) => {
  const { progress } = req.body;
  if (progress === undefined) return res.status(400).json({ error: "progress required" });
  const pct = Number(progress);
  if (isNaN(pct) || pct < 0 || pct > 100) return res.status(400).json({ error: "progress must be 0–100" });

  const completed = pct === 100;

  try {
    const { rows } = await pool.query(
      `UPDATE enrollments
       SET progress = $1, completed = $2, updated_at = now()
       WHERE user_id = $3 AND course_id = $4
       RETURNING *`,
      [pct, completed, req.user!.id, req.params.course_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Enrollment not found" });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update progress" });
  }
});

export default router;
