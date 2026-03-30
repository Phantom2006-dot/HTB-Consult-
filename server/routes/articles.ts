import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin, requireMentorOrAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

function calcReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
             a.read_time_minutes, a.published, a.is_featured, a.created_at,
             u.full_name AS author_name, u.avatar_url AS author_avatar,
             ur.role AS author_role
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN user_roles ur ON ur.user_id = a.author_id
      WHERE a.published = true
      ORDER BY a.is_featured DESC, a.created_at DESC
    `);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/featured", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
             a.read_time_minutes, a.is_featured, a.created_at,
             u.full_name AS author_name, u.avatar_url AS author_avatar,
             ur.role AS author_role
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN user_roles ur ON ur.user_id = a.author_id
      WHERE a.published = true AND a.is_featured = true
      ORDER BY a.created_at DESC
      LIMIT 3
    `);
    if (rows.length > 0) return res.json(rows);
    const { rows: recent } = await pool.query(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
             a.read_time_minutes, a.is_featured, a.created_at,
             u.full_name AS author_name, u.avatar_url AS author_avatar,
             ur.role AS author_role
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN user_roles ur ON ur.user_id = a.author_id
      WHERE a.published = true
      ORDER BY a.created_at DESC
      LIMIT 3
    `);
    return res.json(recent);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/admin/all", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
             a.read_time_minutes, a.published, a.is_featured, a.created_at, a.updated_at,
             u.full_name AS author_name, ur.role AS author_role
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN user_roles ur ON ur.user_id = a.author_id
      ORDER BY a.created_at DESC
    `);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/mentor/mine", requireAuth, requireMentorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
             a.read_time_minutes, a.published, a.is_featured, a.created_at, a.updated_at
      FROM articles a
      WHERE a.author_id = $1
      ORDER BY a.created_at DESC
    `, [req.user!.id]);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.cover_image_url,
             a.read_time_minutes, a.published, a.is_featured, a.created_at,
             u.full_name AS author_name, u.avatar_url AS author_avatar,
             ur.role AS author_role, u.bio AS author_bio
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN user_roles ur ON ur.user_id = a.author_id
      WHERE a.slug = $1 AND a.published = true
    `, [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ error: "Article not found" });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/admin/:id", requireAuth, requireMentorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const isAdmin = req.user!.role === "admin";
    const { rows } = await pool.query(
      isAdmin
        ? `SELECT * FROM articles WHERE id = $1`
        : `SELECT * FROM articles WHERE id = $1 AND author_id = $2`,
      isAdmin ? [req.params.id] : [req.params.id, req.user!.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", requireAuth, requireMentorOrAdmin, async (req: AuthRequest, res) => {
  const { title, excerpt, content, cover_image_url, published, is_featured } = req.body;
  if (!title || !content) return res.status(400).json({ error: "title and content are required" });
  const read_time_minutes = calcReadTime(content);
  let slug = slugify(title);
  const { rows: existing } = await pool.query("SELECT id FROM articles WHERE slug = $1", [slug]);
  if (existing.length > 0) slug = `${slug}-${Date.now()}`;
  try {
    const { rows } = await pool.query(`
      INSERT INTO articles (title, slug, excerpt, content, cover_image_url, author_id, read_time_minutes, published, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, slug, excerpt || null, content, cover_image_url || null, req.user!.id, read_time_minutes, published ?? false, is_featured ?? false]);
    return res.status(201).json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", requireAuth, requireMentorOrAdmin, async (req: AuthRequest, res) => {
  const { title, excerpt, content, cover_image_url, published, is_featured } = req.body;
  try {
    const { rows: existing } = await pool.query(
      "SELECT * FROM articles WHERE id = $1",
      [req.params.id]
    );
    if (existing.length === 0) return res.status(404).json({ error: "Not found" });
    const article = existing[0];
    if (req.user!.role !== "admin" && article.author_id !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const newContent = content ?? article.content;
    const read_time_minutes = calcReadTime(newContent);
    const canFeature = req.user!.role === "admin";
    const { rows } = await pool.query(`
      UPDATE articles SET
        title = $1, excerpt = $2, content = $3, cover_image_url = $4,
        published = $5, read_time_minutes = $6, is_featured = $7, updated_at = now()
      WHERE id = $8
      RETURNING *
    `, [
      title ?? article.title,
      excerpt ?? article.excerpt,
      newContent,
      cover_image_url ?? article.cover_image_url,
      published ?? article.published,
      read_time_minutes,
      canFeature ? (is_featured ?? article.is_featured) : article.is_featured,
      req.params.id,
    ]);
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, requireMentorOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query("SELECT author_id FROM articles WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    if (req.user!.role !== "admin" && rows[0].author_id !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await pool.query("DELETE FROM articles WHERE id = $1", [req.params.id]);
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/:id/read", requireAuth, async (req: AuthRequest, res) => {
  try {
    await pool.query(`
      INSERT INTO article_reads (user_id, article_id) VALUES ($1, $2)
      ON CONFLICT (user_id, article_id) DO NOTHING
    `, [req.user!.id, req.params.id]);
    return res.json({ recorded: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id/read-status", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT 1 FROM article_reads WHERE user_id = $1 AND article_id = $2",
      [req.user!.id, req.params.id]
    );
    return res.json({ read: rows.length > 0 });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
