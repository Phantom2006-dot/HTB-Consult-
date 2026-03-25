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
    return res.json(rows[0] || null);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentor record" });
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
      "SELECT * FROM availability_slots WHERE mentor_id = $1 AND is_active = true ORDER BY day_of_week",
      [req.params.id]
    );
    return res.json({ mentor: mentorRows[0], slots });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mentor" });
  }
});

router.post("/admin", requireAdmin, async (req, res) => {
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

router.patch("/admin/:id", requireAdmin, async (req, res) => {
  const { name, title, bio, specializations, years_experience, hourly_rate, published } = req.body;
  try {
    const specs = Array.isArray(specializations)
      ? specializations
      : (specializations || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const { rows } = await pool.query(
      `UPDATE mentors SET name=$1, title=$2, bio=$3, specializations=$4, years_experience=$5,
       hourly_rate=$6, published=$7, updated_at=now() WHERE id=$8 RETURNING *`,
      [name, title || "", bio || "", specs, parseInt(years_experience) || 0, parseFloat(hourly_rate) || 0, !!published, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Mentor not found" });
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
