import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*,
              m.name        AS mentor_name,
              m.title       AS mentor_title,
              m.avatar_url  AS mentor_avatar,
              m.specialty   AS mentor_specialty
       FROM bookings b
       JOIN mentors  m ON m.id = b.mentor_id
       WHERE b.student_id = $1
       ORDER BY b.session_date ASC, b.start_time ASC`,
      [req.user!.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.get("/as-mentor", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows: mentorRows } = await pool.query("SELECT id FROM mentors WHERE user_id = $1", [req.user!.id]);
    if (mentorRows.length === 0) return res.json([]);
    const { rows } = await pool.query(
      "SELECT * FROM bookings WHERE mentor_id = $1 ORDER BY session_date ASC",
      [mentorRows[0].id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentor bookings" });
  }
});

router.get("/mentor/:mentorId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM bookings WHERE mentor_id = $1 ORDER BY session_date ASC",
      [req.params.mentorId]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { mentor_id, session_date, start_time, end_time, notes } = req.body;
  if (!mentor_id || !session_date || !start_time || !end_time) {
    return res.status(400).json({ error: "mentor_id, session_date, start_time, end_time required" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO bookings (student_id, mentor_id, session_date, start_time, end_time, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user!.id, mentor_id, session_date, start_time, end_time, notes || ""]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create booking" });
  }
});

router.patch("/:id/status", requireAuth, async (req: AuthRequest, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "status required" });
  try {
    const { rows } = await pool.query(
      `UPDATE bookings SET status = $1, updated_at = now()
       WHERE id = $2 AND (student_id = $3 OR mentor_id IN (SELECT id FROM mentors WHERE user_id = $3))
       RETURNING *`,
      [status, req.params.id, req.user!.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Booking not found" });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update booking" });
  }
});

export default router;
