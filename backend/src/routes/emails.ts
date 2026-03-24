import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { folder } = req.query;
  try {
    let query = "SELECT * FROM emails WHERE user_id = $1";
    const params: any[] = [req.user!.id];
    if (folder) {
      query += " AND folder = $2";
      params.push(folder);
    }
    query += " ORDER BY created_at DESC";
    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch emails" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { recipient_id, subject, body, is_draft, folder } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO emails (user_id, sender_id, recipient_id, subject, body, is_draft, folder)
       VALUES ($1,$1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user!.id, recipient_id || req.user!.id, subject || "", body || "", !!is_draft, folder || "sent"]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to send email" });
  }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const { is_read, folder } = req.body;
  try {
    const updates: string[] = [];
    const params: any[] = [];
    let i = 1;
    if (is_read !== undefined) { updates.push(`is_read = $${i++}`); params.push(is_read); }
    if (folder !== undefined) { updates.push(`folder = $${i++}`); params.push(folder); }
    if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });
    params.push(req.params.id, req.user!.id);
    const { rows } = await pool.query(
      `UPDATE emails SET ${updates.join(", ")}, updated_at = now() WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`,
      params
    );
    if (rows.length === 0) return res.status(404).json({ error: "Email not found" });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update email" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await pool.query("DELETE FROM emails WHERE id = $1 AND user_id = $2", [req.params.id, req.user!.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete email" });
  }
});

export default router;
