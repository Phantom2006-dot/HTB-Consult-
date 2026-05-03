import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const [courses, mentors, enrollments, users, revenue, completed, bookings, articles] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM courses WHERE published = true"),
      pool.query("SELECT COUNT(*) FROM mentors WHERE published = true"),
      pool.query("SELECT COUNT(*) FROM enrollments"),
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COALESCE(SUM(c.price), 0) AS total FROM enrollments e JOIN courses c ON c.id = e.course_id"),
      pool.query("SELECT COUNT(*) FROM enrollments WHERE completed = true"),
      pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'"),
      pool.query("SELECT COUNT(*) FROM articles WHERE published = true"),
    ]);
    return res.json({
      courses: parseInt(courses.rows[0].count),
      mentors: parseInt(mentors.rows[0].count),
      enrollments: parseInt(enrollments.rows[0].count),
      users: parseInt(users.rows[0].count),
      revenue: parseFloat(revenue.rows[0].total),
      completed: parseInt(completed.rows[0].count),
      bookings: parseInt(bookings.rows[0].count),
      articles: parseInt(articles.rows[0].count),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/analytics", requireAdmin, async (req, res) => {
  try {
    const period = (req.query.period as string) || "3m";

    // Determine interval + grouping based on period
    type TruncUnit = "week" | "month";
    const config: Record<string, { interval: string; trunc: TruncUnit; fmt: string }> = {
      "1m":  { interval: "1 month",   trunc: "week",  fmt: "Mon DD" },
      "3m":  { interval: "3 months",  trunc: "week",  fmt: "Mon DD" },
      "6m":  { interval: "6 months",  trunc: "month", fmt: "Mon YYYY" },
      "all": { interval: "100 years", trunc: "month", fmt: "Mon YYYY" },
    };
    const { interval, trunc, fmt } = config[period] ?? config["3m"];

    const whereClause = period === "all" ? "" : `WHERE created_at >= NOW() - INTERVAL '${interval}'`;
    const enrollWhereClause = period === "all" ? "" : `WHERE enrolled_at >= NOW() - INTERVAL '${interval}'`;

    const [userGrowth, enrollmentTrend, bookingTrend, topCourses, roleBreakdown, recentUsers] = await Promise.all([
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('${trunc}', created_at), '${fmt}') AS period,
          COUNT(*) AS count
        FROM users
        ${whereClause}
        GROUP BY DATE_TRUNC('${trunc}', created_at)
        ORDER BY DATE_TRUNC('${trunc}', created_at)
      `),
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('${trunc}', enrolled_at), '${fmt}') AS period,
          COUNT(*) AS count
        FROM enrollments
        ${enrollWhereClause}
        GROUP BY DATE_TRUNC('${trunc}', enrolled_at)
        ORDER BY DATE_TRUNC('${trunc}', enrolled_at)
      `),
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('${trunc}', created_at), '${fmt}') AS period,
          COUNT(*) AS count
        FROM bookings
        ${whereClause}
        GROUP BY DATE_TRUNC('${trunc}', created_at)
        ORDER BY DATE_TRUNC('${trunc}', created_at)
      `),
      pool.query(`
        SELECT c.title, c.category, COUNT(e.id) AS enrollments,
               COALESCE(SUM(c.price), 0) AS revenue
        FROM courses c
        LEFT JOIN enrollments e ON e.course_id = c.id
          ${period !== "all" ? `AND e.enrolled_at >= NOW() - INTERVAL '${interval}'` : ""}
        WHERE c.published = true
        GROUP BY c.id, c.title, c.category
        ORDER BY enrollments DESC
        LIMIT 8
      `),
      pool.query(`
        SELECT r.role, COUNT(*) AS count
        FROM user_roles r
        GROUP BY r.role
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT u.id, u.full_name, u.email, u.avatar_url, u.created_at,
               ARRAY_AGG(r.role) FILTER (WHERE r.role IS NOT NULL) AS roles
        FROM users u
        LEFT JOIN user_roles r ON r.user_id = u.id
        GROUP BY u.id, u.full_name, u.email, u.avatar_url, u.created_at
        ORDER BY u.created_at DESC
        LIMIT 8
      `),
    ]);

    return res.json({
      userGrowth: userGrowth.rows,
      enrollmentTrend: enrollmentTrend.rows,
      bookingTrend: bookingTrend.rows,
      topCourses: topCourses.rows,
      roleBreakdown: roleBreakdown.rows,
      recentUsers: recentUsers.rows,
      period,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.get("/visitors", requireAdmin, async (req, res) => {
  try {
    const period = (req.query.period as string) || "14d";

    const trendConfig: Record<string, { interval: string; trunc: string; fmt: string }> = {
      "7d":  { interval: "7 days",   trunc: "day",   fmt: "Mon DD" },
      "14d": { interval: "14 days",  trunc: "day",   fmt: "Mon DD" },
      "1m":  { interval: "1 month",  trunc: "day",   fmt: "Mon DD" },
      "3m":  { interval: "3 months", trunc: "week",  fmt: "Mon DD" },
    };
    const { interval, trunc, fmt } = trendConfig[period] ?? trendConfig["14d"];

    const topPagesInterval = period === "3m" ? "3 months" : period === "1m" ? "1 month" : "30 days";

    const [todayVisits, totalVisits, uniqueToday, uniqueTotal, visitTrend, topPages] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM site_visits WHERE created_at >= CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) FROM site_visits`),
      pool.query(`SELECT COUNT(DISTINCT session_id) FROM site_visits WHERE created_at >= CURRENT_DATE`),
      pool.query(`SELECT COUNT(DISTINCT session_id) FROM site_visits`),
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('${trunc}', created_at), '${fmt}') AS day,
          COUNT(*) AS visits,
          COUNT(DISTINCT session_id) AS unique_visitors
        FROM site_visits
        WHERE created_at >= NOW() - INTERVAL '${interval}'
        GROUP BY DATE_TRUNC('${trunc}', created_at)
        ORDER BY DATE_TRUNC('${trunc}', created_at)
      `),
      pool.query(`
        SELECT page, COUNT(*) AS views, COUNT(DISTINCT session_id) AS unique_views
        FROM site_visits
        WHERE created_at >= NOW() - INTERVAL '${topPagesInterval}'
        GROUP BY page
        ORDER BY views DESC
        LIMIT 10
      `),
    ]);
    return res.json({
      todayVisits: parseInt(todayVisits.rows[0].count),
      totalVisits: parseInt(totalVisits.rows[0].count),
      uniqueToday: parseInt(uniqueToday.rows[0].count),
      uniqueTotal: parseInt(uniqueTotal.rows[0].count),
      visitTrend: visitTrend.rows,
      topPages: topPages.rows,
      period,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch visitor stats" });
  }
});

router.get("/mentors/:id", requireAdmin, async (req, res) => {
  try {
    const { rows: mentorRows } = await pool.query("SELECT * FROM mentors WHERE id = $1", [req.params.id]);
    if (mentorRows.length === 0) return res.status(404).json({ error: "Mentor not found" });
    const { rows: slots } = await pool.query(
      "SELECT * FROM availability_slots WHERE mentor_id = $1 ORDER BY day_of_week, start_time",
      [req.params.id]
    );
    const { rows: bookings } = await pool.query(
      `SELECT b.*, u.full_name AS student_name, u.email AS student_email, u.avatar_url AS student_avatar
       FROM bookings b
       JOIN users u ON u.id = b.student_id
       WHERE b.mentor_id = $1
       ORDER BY b.session_date DESC, b.start_time DESC
       LIMIT 20`,
      [req.params.id]
    );
    return res.json({ mentor: mentorRows[0], slots, bookings });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentor details" });
  }
});

router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const { rows: users } = await pool.query(
      "SELECT id, email, full_name, bio, avatar_url, created_at, is_blocked, email_verified FROM users ORDER BY created_at DESC"
    );
    const { rows: roles } = await pool.query("SELECT user_id, role FROM user_roles ORDER BY created_at ASC");

    // The founding admin is the user who received the admin role first
    const firstAdminRow = roles.find((r) => r.role === "admin");
    const foundingAdminId = firstAdminRow?.user_id ?? null;

    const usersWithRoles = users.map((u) => ({
      ...u,
      roles: roles.filter((r) => r.user_id === u.id).map((r) => r.role),
      is_founding_admin: u.id === foundingAdminId,
    }));
    return res.json(usersWithRoles);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    // Guard: never allow deletion of the founding admin
    const { rows: firstAdmin } = await pool.query(
      "SELECT user_id FROM user_roles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1"
    );
    if (firstAdmin[0]?.user_id === req.params.id) {
      return res.status(403).json({ error: "The founding admin account cannot be deleted." });
    }
    const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "User not found." });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete user." });
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
      // Guard: never allow removal of the founding admin's admin role
      if (role === "admin") {
        const { rows: firstAdmin } = await pool.query(
          "SELECT user_id FROM user_roles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1"
        );
        if (firstAdmin[0]?.user_id === req.params.id) {
          return res.status(403).json({ error: "The founding admin's access cannot be removed." });
        }
      }
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

          // Inbox email (sender_id is null for system-generated notifications)
          await pool.query(
            `INSERT INTO emails (user_id, sender_id, recipient_id, subject, body, folder, is_read, is_draft)
             VALUES ($1, NULL, $1, $2, $3, 'inbox', false, false)`,
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

router.patch("/courses/:id/lock", requireAdmin, async (req, res) => {
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
