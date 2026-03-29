import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const [enrollments, bookings] = await Promise.all([
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
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC
         LIMIT 5`,
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
        });
      } else if (e.progress > 0 && e.progress < 100) {
        notifications.push({
          id: `progress-${e.course_id}`,
          type: "info",
          title: "Learning in progress",
          desc: `You're ${e.progress}% through "${e.course_title}". Keep going!`,
          time: e.created_at,
        });
      } else {
        notifications.push({
          id: `enroll-${e.course_id}`,
          type: "enroll",
          title: "Enrolled in a course",
          desc: `You enrolled in "${e.course_title}".`,
          time: e.created_at,
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
      });
    }

    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return res.json(notifications.slice(0, 15));
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch notifications" });
  }
});

export default router;
