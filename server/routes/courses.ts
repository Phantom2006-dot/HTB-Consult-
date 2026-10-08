import { Router } from "express";
import { pool } from "../db.js";
import { optionalAuth, requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (v: string | string[]) => typeof v === "string" && UUID_RE.test(v);

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM courses WHERE published = true ORDER BY created_at DESC"
    );
    return res.json(rows.map(({ live_class_url, ...course }) => course));
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

router.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  if (!isUUID(req.params.id)) return res.status(404).json({ error: "Course not found" });
  try {
    const isAdmin = req.user?.role === "admin";
    const { rows: courseRows } = await pool.query(
      "SELECT * FROM courses WHERE id = $1 AND (published = true OR $2::boolean)",
      [req.params.id, isAdmin]
    );
    if (courseRows.length === 0) return res.status(404).json({ error: "Course not found" });

    let canAccessProtectedContent = isAdmin;
    if (req.user && !isAdmin) {
      const { rows: enrollmentRows } = await pool.query(
        "SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2 LIMIT 1",
        [req.user.id, req.params.id]
      );
      canAccessProtectedContent = enrollmentRows.length > 0;
    }

    // ── Try sort_order first (new schema), fallback to position (old schema) ──
    let modules: any[] = [];
    try {
      const { rows } = await pool.query(
        "SELECT * FROM modules WHERE course_id = $1 ORDER BY sort_order",
        [req.params.id]
      );
      modules = rows;
    } catch (sortOrderErr: any) {
      // If sort_order doesn't exist, try position (legacy schema)
      if (sortOrderErr.message?.includes("sort_order")) {
        const { rows } = await pool.query(
          "SELECT * FROM modules WHERE course_id = $1 ORDER BY position",
          [req.params.id]
        );
        modules = rows;
      } else {
        throw sortOrderErr;
      }
    }

    const moduleIds = modules.map((m) => m.id);
    let lessons: any[] = [];
    if (moduleIds.length > 0) {
      try {
        const { rows } = await pool.query(
          `SELECT * FROM lessons WHERE module_id = ANY($1) ORDER BY sort_order`,
          [moduleIds]
        );
        lessons = rows;
      } catch (sortOrderErr: any) {
        // If sort_order doesn't exist, try position (legacy schema)
        if (sortOrderErr.message?.includes("sort_order")) {
          const { rows } = await pool.query(
            `SELECT * FROM lessons WHERE module_id = ANY($1) ORDER BY position`,
            [moduleIds]
          );
          lessons = rows;
        } else {
          throw sortOrderErr;
        }
      }
    }

    const modulesWithLessons = modules.map((m) => ({
      ...m,
      lessons: lessons.filter((l) => l.module_id === m.id).map((lesson) => {
        if (canAccessProtectedContent || lesson.is_free) return lesson;
        const { content, video_url, ...publicLesson } = lesson;
        return publicLesson;
      }),
    }));
    const course = { ...courseRows[0] };
    if (!canAccessProtectedContent) delete course.live_class_url;
    return res.json({ course, modules: modulesWithLessons });
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
  if (!isUUID(req.params.id)) return res.status(404).json({ error: "Course not found" });
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
  if (!isUUID(req.params.id)) return res.status(404).json({ error: "Course not found" });
  const { is_locked } = req.body;
  if (typeof is_locked !== "boolean") return res.status(400).json({ error: "is_locked (boolean) required" });
  try {
    const { rows } = await pool.query(
      "UPDATE courses SET is_locked = $1, updated_at = now() WHERE id = $2 RETURNING *",
      [is_locked, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Course not found" });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update course lock status" });
  }
});

export default router;
