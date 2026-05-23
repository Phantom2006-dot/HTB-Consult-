import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  try {
    const { rows } = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM enrollments
         WHERE user_id = $1 AND completed = false AND progress > 0)::int AS courses_in_progress,
        (SELECT COUNT(*) FROM enrollments
         WHERE user_id = $1 AND completed = true)::int AS completed_courses,
        (SELECT COUNT(*) FROM certificates
         WHERE user_id = $1)::int AS certificates_earned,
        (SELECT COALESCE(
           (SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1 AND completed = true),
           0
         ))::int AS completed_lessons,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = $1)::int AS total_enrolled,
        (SELECT COALESCE(
           (SELECT COUNT(DISTINCT DATE(created_at)) FROM lesson_progress
            WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'),
           0
         ))::int AS active_days_30
      `,
      [userId]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
