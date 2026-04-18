import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const [enrollments, bookings, articles, systemNotifs] = await Promise.all([
      pool.query(
        `SELECT e.enrolled_at AS created_at, e.completed, e.progress,
                c.title AS course_title, c.id AS course_id
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         WHERE e.user_id = $1
         ORDER BY e.enrolled_at DESC
         LIMIT 10`,
        [userId]
      ),
      pool.query(
        `SELECT b.created_at, b.status, b.session_date,
                m.name AS mentor_name
         FROM bookings b
         JOIN mentors m ON m.id = b.mentor_id
         WHERE b.student_id = $1
         ORDER BY b.created_at DESC
         LIMIT 5`,
        [userId]
      ),
      pool.query(
        `SELECT a.id, a.title, a.slug, a.created_at, a.cover_image_url,
                u.full_name AS author_name
         FROM articles a
         LEFT JOIN users u ON u.id = a.author_id
         WHERE a.published = true
         ORDER BY a.created_at DESC
         LIMIT 5`
      ),
      pool.query(
        `SELECT id, type, title, body, link, is_read, created_at
         FROM user_notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId]
      ),
    ]);

    const notifications: any[] = [];

    for (const e of enrollments.rows) {
      if (e.completed) {
        notifications.push({
          id: `complete-${e.course_id}`,
          type: "success",
          title: "Course completed!",
          desc: `You completed "${e.course_title}". Well done!`,
          time: e.created_at,
          link: `/course/${e.course_id}`,
        });
      } else if (e.progress > 0 && e.progress < 100) {
        notifications.push({
          id: `progress-${e.course_id}`,
          type: "info",
          title: "Learning in progress",
          desc: `You're ${e.progress}% through "${e.course_title}". Keep going!`,
          time: e.created_at,
          link: `/course/${e.course_id}`,
        });
      } else {
        notifications.push({
          id: `enroll-${e.course_id}`,
          type: "enroll",
          title: "Enrolled in a course",
          desc: `You enrolled in "${e.course_title}".`,
          time: e.created_at,
          link: `/course/${e.course_id}`,
        });
      }
    }

    for (const b of bookings.rows) {
      const statusMap: Record<string, string> = {
        confirmed: "Booking confirmed",
        pending: "Booking pending",
        cancelled: "Booking cancelled",
      };
      notifications.push({
        id: `booking-${b.created_at}`,
        type: b.status === "confirmed" ? "success" : b.status === "cancelled" ? "warning" : "info",
        title: statusMap[b.status] || "Mentoring booking",
        desc: `Session with ${b.mentor_name}${b.session_date ? " on " + new Date(b.session_date).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : ""}.`,
        time: b.created_at,
        link: "/mentors",
      });
    }

    for (const a of articles.rows) {
      notifications.push({
        id: `article-${a.id}`,
        type: "article",
        title: "New article published",
        desc: `"${a.title}"${a.author_name ? ` by ${a.author_name}` : ""} — tap to read.`,
        time: a.created_at,
        link: `/blog/${a.slug}`,
        cover: a.cover_image_url,
      });
    }

    for (const n of systemNotifs.rows) {
      notifications.push({
        id: `notif-${n.id}`,
        type: n.type,
        title: n.title,
        desc: n.body,
        time: n.created_at,
        link: n.link || null,
        is_read: n.is_read,
        persistent_id: n.id,
      });
    }

    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return res.json(notifications.slice(0, 20));
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch notifications" });
  }
});

// ── Mark all notifications as seen ────────────────────────────────────────────
router.post("/mark-seen", requireAuth, async (req: AuthRequest, res) => {
  try {
    await pool.query(
      `UPDATE users SET last_notifications_viewed_at = now() WHERE id = $1`,
      [req.user!.id]
    );
    // Also mark persistent user_notifications as read
    await pool.query(
      `UPDATE user_notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
      [req.user!.id]
    );
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to mark seen" });
  }
});

// ── Unread counts for badge indicators ────────────────────────────────────────
router.get("/unread-count", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  try {
    // Fetch the user's last_notifications_viewed_at once
    const userRow = await pool.query(
      `SELECT last_notifications_viewed_at FROM users WHERE id = $1`,
      [userId]
    );
    const lastViewed: Date | null = userRow.rows[0]?.last_notifications_viewed_at ?? null;
    // If never viewed, use 30 days ago as baseline so we don't flood with ancient items
    const since = lastViewed ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [emailsResult, messagesResult, enrollResult, bookingResult, articleResult, systemNotifsResult] = await Promise.all([
      // Unread inbox emails
      pool.query(
        `SELECT COUNT(*) FROM emails
         WHERE user_id = $1 AND is_read = false AND folder = 'inbox' AND is_draft = false`,
        [userId]
      ),
      // Unread user-to-user messages
      pool.query(
        `SELECT COUNT(*) FROM chat_conversations cc
         WHERE cc.user_id = $1
           AND cc.type = 'user'
           AND cc.updated_at > (SELECT COALESCE(last_seen_at, now() - interval '1 day') FROM users WHERE id = $1)
           AND EXISTS (
             SELECT 1 FROM chat_messages cm
             WHERE cm.conversation_id = cc.id
               AND cm.sender_id != $1
               AND cm.is_deleted = false
               AND cm.created_at > (SELECT COALESCE(last_seen_at, now() - interval '1 day') FROM users WHERE id = $1)
           )`,
        [userId]
      ),
      // New enrollments since last viewed
      pool.query(
        `SELECT COUNT(*) FROM enrollments
         WHERE user_id = $1 AND enrolled_at > $2`,
        [userId, since]
      ),
      // New bookings since last viewed
      pool.query(
        `SELECT COUNT(*) FROM bookings
         WHERE student_id = $1 AND created_at > $2`,
        [userId, since]
      ),
      // New published articles since last viewed
      pool.query(
        `SELECT COUNT(*) FROM articles
         WHERE published = true AND created_at > $1`,
        [since]
      ),
      // Unread persistent system notifications
      pool.query(
        `SELECT COUNT(*) FROM user_notifications
         WHERE user_id = $1 AND is_read = false`,
        [userId]
      ),
    ]);

    const notifCount =
      parseInt(enrollResult.rows[0].count, 10) +
      parseInt(bookingResult.rows[0].count, 10) +
      parseInt(articleResult.rows[0].count, 10) +
      parseInt(systemNotifsResult.rows[0].count, 10);

    return res.json({
      emails: parseInt(emailsResult.rows[0].count, 10),
      messages: parseInt(messagesResult.rows[0].count, 10),
      notifications: notifCount,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch unread counts" });
  }
});

export default router;
