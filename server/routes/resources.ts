import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (v: string) => UUID_RE.test(v);

router.get("/course/:courseId", async (req, res) => {
  if (!isUUID(req.params.courseId)) return res.json([]);
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.title, r.file_url, r.file_type, r.file_size, r.created_at,
              u.full_name AS uploaded_by_name
       FROM course_resources r
       LEFT JOIN users u ON u.id = r.uploaded_by
       WHERE r.course_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.courseId]
    );
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/course/:courseId", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  if (!isUUID(req.params.courseId)) return res.status(404).json({ error: "Course not found" });
  try {
    const { title, file_url, file_type, file_size } = req.body;
    if (!title || !file_url) {
      return res.status(400).json({ error: "title and file_url are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO course_resources (course_id, title, file_url, file_type, file_size, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.params.courseId, title, file_url, file_type || "pptx", file_size || null, req.user!.id]
    );
    return res.status(201).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  if (!isUUID(req.params.id)) return res.status(404).json({ error: "Not found" });
  try {
    const { title } = req.body;
    const { rows } = await pool.query(
      `UPDATE course_resources SET title = $1 WHERE id = $2 RETURNING *`,
      [title, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  if (!isUUID(req.params.id)) return res.status(404).json({ error: "Not found" });
  try {
    await pool.query("DELETE FROM course_resources WHERE id = $1", [req.params.id]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
