import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM mentors WHERE published = true ORDER BY rating DESC");
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentors" });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM mentors WHERE user_id = $1", [req.user!.id]);
    if (rows.length > 0) return res.json(rows[0]);

    const { rows: roleRows } = await pool.query(
      "SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'mentor'",
      [req.user!.id]
    );
    if (roleRows.length > 0) {
      const { rows: userRows } = await pool.query("SELECT full_name FROM users WHERE id = $1", [req.user!.id]);
      const name = userRows[0]?.full_name || req.user!.email.split("@")[0];
      const { rows: created } = await pool.query(
        `INSERT INTO mentors (user_id, name, title, bio, published) VALUES ($1,$2,'','',false) RETURNING *`,
        [req.user!.id, name]
      );
      return res.json(created[0]);
    }
    return res.json(null);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentor record" });
  }
});

router.patch("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows: current } = await pool.query("SELECT * FROM mentors WHERE user_id = $1", [req.user!.id]);
    if (current.length === 0) return res.status(404).json({ error: "No mentor profile found" });
    const m = current[0];
    const b = req.body;
    const specs = b.specializations !== undefined
      ? (Array.isArray(b.specializations) ? b.specializations : (b.specializations || "").split(",").map((s: string) => s.trim()).filter(Boolean))
      : m.specializations;
    const { rows } = await pool.query(
      `UPDATE mentors SET name=$1, title=$2, bio=$3, specializations=$4, years_experience=$5,
       hourly_rate=$6, avatar_url=$7, updated_at=now() WHERE user_id=$8 RETURNING *`,
      [
        b.name ?? m.name,
        b.title ?? m.title,
        b.bio ?? m.bio,
        specs,
        b.years_experience !== undefined ? parseInt(b.years_experience) : m.years_experience,
        b.hourly_rate !== undefined ? parseFloat(b.hourly_rate) : m.hourly_rate,
        b.avatar_url !== undefined ? (b.avatar_url || null) : m.avatar_url,
        req.user!.id,
      ]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update mentor profile" });
  }
});

router.get("/me/slots", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows: mentorRows } = await pool.query("SELECT id FROM mentors WHERE user_id = $1", [req.user!.id]);
    if (mentorRows.length === 0) return res.status(404).json({ error: "No mentor profile" });
    const { rows } = await pool.query(
      "SELECT * FROM availability_slots WHERE mentor_id = $1 ORDER BY day_of_week, start_time",
      [mentorRows[0].id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch slots" });
  }
});

router.patch("/me/slots", requireAuth, async (req: AuthRequest, res) => {
  const { slots } = req.body;
  if (!Array.isArray(slots)) return res.status(400).json({ error: "slots must be an array" });
  const client = await pool.connect();
  try {
    const { rows: mentorRows } = await client.query("SELECT id FROM mentors WHERE user_id = $1", [req.user!.id]);
    if (mentorRows.length === 0) return res.status(404).json({ error: "No mentor profile" });
    const mentorId = mentorRows[0].id;
    await client.query("BEGIN");
    await client.query("DELETE FROM availability_slots WHERE mentor_id = $1", [mentorId]);
    for (const slot of slots) {
      const { day_of_week, start_time, end_time } = slot;
      if (day_of_week === undefined || !start_time || !end_time) continue;
      await client.query(
        "INSERT INTO availability_slots (mentor_id, day_of_week, start_time, end_time, is_active) VALUES ($1,$2,$3,$4,true)",
        [mentorId, day_of_week, start_time, end_time]
      );
    }
    await client.query("COMMIT");
    const { rows } = await client.query(
      "SELECT * FROM availability_slots WHERE mentor_id = $1 ORDER BY day_of_week, start_time",
      [mentorId]
    );
    return res.json(rows);
  } catch (err: any) {
    await client.query("ROLLBACK");
    return res.status(500).json({ error: err.message || "Failed to save slots" });
  } finally {
    client.release();
  }
});

router.get("/admin/all", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM mentors ORDER BY created_at DESC");
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentors" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows: mentorRows } = await pool.query("SELECT * FROM mentors WHERE id = $1", [req.params.id]);
    if (mentorRows.length === 0) return res.status(404).json({ error: "Mentor not found" });
    const { rows: slots } = await pool.query(
      "SELECT * FROM availability_slots WHERE mentor_id = $1 AND is_active = true ORDER BY day_of_week, start_time",
      [req.params.id]
    );
    return res.json({ mentor: mentorRows[0], slots });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentor" });
  }
});

router.get("/admin/:id/slots", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM availability_slots WHERE mentor_id = $1 ORDER BY day_of_week, start_time",
      [req.params.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch slots" });
  }
});

router.patch("/admin/:id/slots", requireAdmin, async (req, res) => {
  const { slots } = req.body;
  if (!Array.isArray(slots)) return res.status(400).json({ error: "slots must be an array" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM availability_slots WHERE mentor_id = $1", [req.params.id]);

    for (const slot of slots) {
      const { day_of_week, start_time, end_time } = slot;
      if (day_of_week === undefined || !start_time || !end_time) continue;
      await client.query(
        "INSERT INTO availability_slots (mentor_id, day_of_week, start_time, end_time, is_active) VALUES ($1,$2,$3,$4,true)",
        [req.params.id, day_of_week, start_time, end_time]
      );
    }
    await client.query("COMMIT");
    const { rows } = await client.query(
      "SELECT * FROM availability_slots WHERE mentor_id = $1 ORDER BY day_of_week, start_time",
      [req.params.id]
    );
    return res.json(rows);
  } catch (err: any) {
    await client.query("ROLLBACK");
    return res.status(500).json({ error: err.message || "Failed to save slots" });
  } finally {
    client.release();
  }
});

router.post("/admin", requireAdmin, async (req, res) => {
  const { name, title, bio, avatar_url, specializations, years_experience, hourly_rate, published } = req.body;
  try {
    const specs = Array.isArray(specializations)
      ? specializations
      : (specializations || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const { rows } = await pool.query(
      `INSERT INTO mentors (name, title, bio, avatar_url, specializations, years_experience, hourly_rate, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, title || "", bio || "", avatar_url || null, specs, parseInt(years_experience) || 0, parseFloat(hourly_rate) || 0, !!published]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create mentor" });
  }
});

router.patch("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { rows: current } = await pool.query("SELECT * FROM mentors WHERE id = $1", [req.params.id]);
    if (current.length === 0) return res.status(404).json({ error: "Mentor not found" });
    const m = current[0];
    const b = req.body;
    const specs = b.specializations !== undefined
      ? (Array.isArray(b.specializations) ? b.specializations : (b.specializations || "").split(",").map((s: string) => s.trim()).filter(Boolean))
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

router.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM mentors WHERE id = $1", [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete mentor" });
  }
});

export default router;
