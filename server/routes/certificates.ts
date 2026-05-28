import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get certificates for the logged-in user
router.get("/my", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.course_id, c.issued_at, c.verification_code,
              co.title AS course_title, co.category, co.thumbnail_url
       FROM certificates c
       JOIN courses co ON co.id = c.course_id
       WHERE c.user_id = $1
       ORDER BY c.issued_at DESC`,
      [req.user!.id]
    );
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

// Admin: issue a certificate for a user+course
router.post("/", requireAdmin, async (req: AuthRequest, res) => {
  const { user_id, course_id } = req.body;
  if (!user_id || !course_id) return res.status(400).json({ error: "user_id and course_id required" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO certificates (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING
       RETURNING *`,
      [user_id, course_id]
    );
    if (rows.length === 0) return res.json({ message: "Certificate already issued" });

    // Fetch user + course names for the notification
    const [userRow, courseRow] = await Promise.all([
      pool.query(`SELECT full_name FROM users WHERE id = $1`, [user_id]),
      pool.query(`SELECT title FROM courses WHERE id = $1`, [course_id]),
    ]);
    const userName = userRow.rows[0]?.full_name || "there";
    const courseTitle = courseRow.rows[0]?.title || "your course";

    // Fire an in-app notification to the student
    await pool.query(
      `INSERT INTO user_notifications (user_id, type, title, body, link)
       VALUES ($1, 'success', $2, $3, $4)`,
      [
        user_id,
        "🎓 Certificate Issued!",
        `Congratulations ${userName}! You've been awarded a certificate for completing "${courseTitle}". View it in your Certificates section.`,
        "/certificates",
      ]
    );

    return res.status(201).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to issue certificate" });
  }
});

// Admin: revoke a certificate
router.delete("/:id", requireAdmin, async (_req, res) => {
  try {
    await pool.query("DELETE FROM certificates WHERE id = $1", [_req.params.id]);
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to revoke certificate" });
  }
});

// Admin: get all certificates (with user & course info)
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.issued_at, c.verification_code,
              c.user_id, c.course_id,
              u.full_name, u.email,
              co.title AS course_title, co.thumbnail_url
       FROM certificates c
       JOIN users u ON u.id = c.user_id
       JOIN courses co ON co.id = c.course_id
       ORDER BY c.issued_at DESC`
    );
    return res.json(rows);
  } catch {
    return res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

export default router;
