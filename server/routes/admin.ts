import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const [courses, mentors, enrollments, users, revenue, completed] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM courses WHERE published = true"),
      pool.query("SELECT COUNT(*) FROM mentors WHERE published = true"),
      pool.query("SELECT COUNT(*) FROM enrollments"),
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COALESCE(SUM(c.price), 0) AS total FROM enrollments e JOIN courses c ON c.id = e.course_id"),
      pool.query("SELECT COUNT(*) FROM enrollments WHERE completed = true"),
    ]);
    return res.json({
      courses: parseInt(courses.rows[0].count),
      mentors: parseInt(mentors.rows[0].count),
      enrollments: parseInt(enrollments.rows[0].count),
      users: parseInt(users.rows[0].count),
      revenue: parseFloat(revenue.rows[0].total),
      completed: parseInt(completed.rows[0].count),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const { rows: users } = await pool.query(
      "SELECT id, email, full_name, bio, avatar_url, created_at, is_blocked FROM users ORDER BY created_at DESC"
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

router.patch("/users/:id/block", requireAdmin, async (req, res) => {
  const { blocked } = req.body;
  if (typeof blocked !== "boolean") return res.status(400).json({ error: "blocked (boolean) required" });
  try {
    await pool.query("UPDATE users SET is_blocked = $1, updated_at = now() WHERE id = $2", [blocked, req.params.id]);
    return res.json({ success: true, is_blocked: blocked });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update user block status" });
  }
});

router.patch("/users/:id/role", requireAdmin, async (req, res) => {
  const { role, grant } = req.body;
  if (!role) return res.status(400).json({ error: "role required" });
  try {
    if (grant === false) {
      await pool.query("DELETE FROM user_roles WHERE user_id = $1 AND role = $2", [req.params.id, role]);
    } else {
      const { rowCount } = await pool.query(
        "INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO NOTHING",
        [req.params.id, role]
      );

      // Only notify if the role was actually newly granted (not a duplicate)
      if (rowCount && rowCount > 0) {
        const { rows: userRows } = await pool.query(
          "SELECT id, full_name, email FROM users WHERE id = $1",
          [req.params.id]
        );
        const target = userRows[0];
        if (target) {
          const roleLabel = role === "admin" ? "Administrator" : role === "mentor" ? "Mentor" : role;
          const title = `You've been granted ${roleLabel} access`;
          const body = `Hi ${target.full_name || "there"}, your account has been upgraded to ${roleLabel} on HTB Consults Academy. You now have access to ${role === "admin" ? "the admin dashboard and all management tools" : "mentor features and session management"}.`;

          // In-app notification
          await pool.query(
            `INSERT INTO user_notifications (user_id, type, title, body, link)
             VALUES ($1, 'success', $2, $3, $4)`,
            [req.params.id, title, body, role === "admin" ? "/admin" : "/dashboard"]
          );

          // Inbox email
          await pool.query(
            `INSERT INTO emails (user_id, recipient_id, subject, body, folder, is_read, is_draft)
             VALUES ($1, $1, $2, $3, 'inbox', false, false)`,
            [req.params.id, title, body]
          );
        }
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update role" });
  }
});

router.get("/enrollments", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.email, u.full_name,
              json_build_object('title', c.title, 'category', c.category) AS courses
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

router.get("/recent-enrollments", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.email, u.full_name,
              json_build_object('title', c.title, 'category', c.category) AS courses
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       JOIN courses c ON c.id = e.course_id
       ORDER BY e.enrolled_at DESC
       LIMIT 10`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch recent enrollments" });
  }
});

router.get("/courses", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM courses ORDER BY created_at DESC");
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.post("/courses", requireAdmin, async (req, res) => {
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

router.patch("/courses/:id", requireAdmin, async (req, res) => {
  try {
    const { rows: current } = await pool.query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
    if (current.length === 0) return res.status(404).json({ error: "Course not found" });
    const c = current[0];
    const b = req.body;
    const tagsArr = b.tags !== undefined
      ? (Array.isArray(b.tags) ? b.tags : b.tags.split(",").map((t: string) => t.trim()).filter(Boolean))
      : c.tags;
    const { rows } = await pool.query(
      `UPDATE courses SET title=$1, description=$2, category=$3, skill_level=$4, course_type=$5,
       price=$6, total_duration=$7, tags=$8, thumbnail_url=$9, live_class_url=$10,
       published=$11, updated_at=now() WHERE id=$12 RETURNING *`,
      [
        b.title ?? c.title,
        b.description ?? c.description,
        b.category ?? c.category,
        b.skill_level ?? c.skill_level,
        b.course_type ?? c.course_type,
        b.price !== undefined ? parseFloat(b.price) : c.price,
        b.total_duration ?? c.total_duration,
        tagsArr,
        b.thumbnail_url !== undefined ? (b.thumbnail_url || null) : c.thumbnail_url,
        b.live_class_url !== undefined ? (b.live_class_url || null) : c.live_class_url,
        b.published !== undefined ? !!b.published : c.published,
        req.params.id,
      ]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update course" });
  }
});

router.delete("/courses/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM courses WHERE id = $1", [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete course" });
  }
});

router.get("/mentors", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM mentors ORDER BY created_at DESC");
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentors" });
  }
});

router.post("/mentors", requireAdmin, async (req, res) => {
  const { name, title, bio, specializations, years_experience, hourly_rate, published } = req.body;
  try {
    const specs = Array.isArray(specializations)
      ? specializations
      : (specializations || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const { rows } = await pool.query(
      `INSERT INTO mentors (name, title, bio, specializations, years_experience, hourly_rate, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, title || "", bio || "", specs, parseInt(years_experience) || 0, parseFloat(hourly_rate) || 0, !!published]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create mentor" });
  }
});

router.patch("/mentors/:id", requireAdmin, async (req, res) => {
  try {
    const { rows: current } = await pool.query("SELECT * FROM mentors WHERE id = $1", [req.params.id]);
    if (current.length === 0) return res.status(404).json({ error: "Mentor not found" });
    const m = current[0];
    const b = req.body;
    const specs = b.specializations !== undefined
      ? (Array.isArray(b.specializations) ? b.specializations : b.specializations.split(",").map((s: string) => s.trim()).filter(Boolean))
      : m.specializations;
    const { rows } = await pool.query(
      `UPDATE mentors SET name=$1, title=$2, bio=$3, specializations=$4, years_experience=$5,
       hourly_rate=$6, published=$7, avatar_url=$8, updated_at=now() WHERE id=$9 RETURNING *`,
      [
        b.name ?? m.name,
        b.title ?? m.title,
        b.bio ?? m.bio,
        specs,
        b.years_experience !== undefined ? parseInt(b.years_experience) : m.years_experience,
        b.hourly_rate !== undefined ? parseFloat(b.hourly_rate) : m.hourly_rate,
        b.published !== undefined ? !!b.published : m.published,
        b.avatar_url !== undefined ? (b.avatar_url || null) : m.avatar_url,
        req.params.id,
      ]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update mentor" });
  }
});

router.delete("/mentors/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM mentors WHERE id = $1", [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete mentor" });
  }
});

export default router;
