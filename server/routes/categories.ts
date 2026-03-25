import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories ORDER BY name");
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    if (err.code === "23505") return res.status(400).json({ error: "Category already exists" });
    return res.status(500).json({ error: "Failed to create category" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    const { rows } = await pool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
      [name, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Category not found" });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update category" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id = $1", [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
