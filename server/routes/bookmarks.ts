import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, row_to_json(c) AS courses
       FROM bookmarks b
       JOIN courses c ON c.id = b.course_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user!.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

router.post("/:courseId/toggle", requireAuth, async (req: AuthRequest, res) => {
  const { courseId } = req.params;
  try {
    const { rows: existing } = await pool.query(
      "SELECT id FROM bookmarks WHERE user_id = $1 AND course_id = $2",
      [req.user!.id, courseId]
    );
    if (existing.length > 0) {
      await pool.query("DELETE FROM bookmarks WHERE id = $1", [existing[0].id]);
      return res.json({ action: "removed" });
    } else {
      await pool.query("INSERT INTO bookmarks (user_id, course_id) VALUES ($1, $2)", [req.user!.id, courseId]);
      return res.json({ action: "added" });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to toggle bookmark" });
  }
});

export default router;
