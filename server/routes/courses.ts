import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM courses WHERE published = true ORDER BY created_at DESC"
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.get("/admin/all", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM courses ORDER BY created_at DESC");
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows: courseRows } = await pool.query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
    if (courseRows.length === 0) return res.status(404).json({ error: "Course not found" });

    const { rows: modules } = await pool.query(
      "SELECT * FROM modules WHERE course_id = $1 ORDER BY position",
      [req.params.id]
    );
    const moduleIds = modules.map((m) => m.id);
    let lessons: any[] = [];
    if (moduleIds.length > 0) {
      const { rows } = await pool.query(
        `SELECT * FROM lessons WHERE module_id = ANY($1) ORDER BY position`,
        [moduleIds]
      );
      lessons = rows;
    }
    const modulesWithLessons = modules.map((m) => ({
      ...m,
      lessons: lessons.filter((l) => l.module_id === m.id),
    }));
    return res.json({ course: courseRows[0], modules: modulesWithLessons });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch course" });
  }
});

router.post("/admin", requireAdmin, async (req, res) => {
  const { title, description, category, skill_level, course_type, price, total_duration, tags, thumbnail_url, live_class_url, published } = req.body;
  try {
    const tagsArr = Array.isArray(tags) ? tags : (tags || "").split(",").map((t: string) => t.trim()).filter(Boolean);
    const { rows } = await pool.query(
      `INSERT INTO courses (title, description, category, skill_level, course_type, price, total_duration, tags, thumbnail_url, live_class_url, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [title, description || "", category || "General", skill_level || "Beginner", course_type || "video",
       parseFloat(price) || 0, total_duration || "", tagsArr, thumbnail_url || null, live_class_url || null, !!published]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create course" });
  }
});

router.patch("/admin/:id", requireAdmin, async (req, res) => {
  const { title, description, category, skill_level, course_type, price, total_duration, tags, thumbnail_url, live_class_url, published } = req.body;
  try {
    const tagsArr = Array.isArray(tags) ? tags : (tags || "").split(",").map((t: string) => t.trim()).filter(Boolean);
    const { rows } = await pool.query(
      `UPDATE courses SET title=$1, description=$2, category=$3, skill_level=$4, course_type=$5,
       price=$6, total_duration=$7, tags=$8, thumbnail_url=$9, live_class_url=$10, published=$11, updated_at=now()
       WHERE id=$12 RETURNING *`,
      [title, description || "", category || "General", skill_level || "Beginner", course_type || "video",
       parseFloat(price) || 0, total_duration || "", tagsArr, thumbnail_url || null, live_class_url || null, !!published, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Course not found" });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update course" });
  }
});

router.patch("/admin/:id/lock", requireAdmin, async (req, res) => {
  const { is_locked } = req.body;
  if (typeof is_locked !== "boolean") return res.status(400).json({ error: "is_locked (boolean) required" });
  try {
    const { rows } = await pool.query(
      "UPDATE courses SET is_locked = $1, updated_at = now() WHERE id = $2 RETURNING *",
      [is_locked, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Course not found" });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update course lock status" });
  }
});

router.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM courses WHERE id = $1", [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete course" });
  }
});

export default router;
