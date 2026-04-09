import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

const SYSTEM_PROMPT = `You are the HTB Consults AI Assistant — a helpful, professional career and training advisor for HighTicketBoss (HTB Consults). You help users with:
- Project Management training and certification guidance (PMP, PRINCE2, Agile)
- Business Analysis training and career advice (BCS, CBAP)
- CV review tips and career roadmap planning
- Mentoring session preparation
- General career development in tech and business

Be concise, encouraging, and professional. Use markdown formatting for clarity. If asked about pricing or bookings, direct users to the Services or Courses pages.`;

type AIProvider = { url: string; key: string; model: string; provider: string };

function getAllProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (process.env.GROQ_API_KEY) {
    providers.push({
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      provider: "Groq",
    });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: process.env.GEMINI_API_KEY,
      model: "gemini-1.5-flash",
      provider: "Google Gemini",
    });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      url: "https://api.openai.com/v1/chat/completions",
      key: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      provider: "OpenAI",
    });
  }
  return providers;
}

// ── AI stream ────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { messages } = req.body;

  const providers = getAllProviders();
  if (providers.length === 0) {
    return res.status(500).json({ error: "No AI API key configured." });
  }

  const payload = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m: any) => ({ role: m.role, content: m.content })),
  ];

  let lastError = "AI service unavailable";
  logger.info("AI chat request", { messageCount: messages.length, providers: providers.map(p => p.provider) });

  for (const provider of providers) {
    logger.info(`Trying AI provider: ${provider.provider}`, { model: provider.model });
    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: provider.model, messages: payload, stream: true }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`${provider.provider} responded with error`, { status: response.status, body: errorText.slice(0, 300) });
        if (response.status === 429 || response.status === 503) {
          lastError = `${provider.provider} rate limit reached`;
          logger.warn(`Rate limited by ${provider.provider}, falling back`);
          continue;
        }
        lastError = `${provider.provider} unavailable (${response.status})`;
        continue;
      }

      logger.info(`Streaming response from ${provider.provider}`);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
      res.end();
      logger.info(`AI response complete via ${provider.provider}`);
      return;
    } catch (err: any) {
      logger.error(`${provider.provider} fetch failed`, { error: err.message });
      lastError = err.message || "Network error";
      continue;
    }
  }

  logger.error("All AI providers exhausted", { lastError });
  if (!res.headersSent) {
    res.status(429).json({ error: "All AI providers are currently rate-limited. Please try again in a moment." });
  }
});

// ── Ping (update last_seen_at) ────────────────────────────────────────────────
router.post("/ping", requireAuth, async (req: AuthRequest, res) => {
  try {
    await pool.query("UPDATE users SET last_seen_at = now() WHERE id = $1", [req.user!.id]);
    return res.json({ ok: true });
  } catch {
    return res.json({ ok: true });
  }
});

// ── List users for starting DMs ───────────────────────────────────────────────
router.get("/users", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.avatar_url,
              u.last_seen_at,
              (u.last_seen_at > now() - interval '5 minutes') AS is_online
       FROM users u
       WHERE u.id != $1
       ORDER BY u.full_name ASC`,
      [req.user!.id]
    );
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ── Conversations CRUD ─────────────────────────────────────────────────────────
router.get("/conversations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT cc.*,
              p.full_name AS participant_name,
              p.avatar_url AS participant_avatar,
              (p.last_seen_at > now() - interval '5 minutes') AS participant_online
       FROM chat_conversations cc
       LEFT JOIN users p ON p.id = cc.participant_id
       WHERE cc.user_id = $1
       ORDER BY cc.updated_at DESC`,
      [req.user!.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/conversations", requireAuth, async (req: AuthRequest, res) => {
  const { title, type, participant_id } = req.body;
  try {
    // For user-to-user DMs, check if one already exists
    if ((type === "user" || type === "group") && participant_id) {
      const existing = await pool.query(
        "SELECT * FROM chat_conversations WHERE user_id = $1 AND participant_id = $2 AND type = $3 LIMIT 1",
        [req.user!.id, participant_id, type]
      );
      if (existing.rows.length > 0) return res.json(existing.rows[0]);
    }

    const { rows } = await pool.query(
      "INSERT INTO chat_conversations (user_id, title, type, participant_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [req.user!.id, title || "New Chat", type || "ai", participant_id || null]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create conversation" });
  }
});

router.patch("/conversations/:id", requireAuth, async (req: AuthRequest, res) => {
  const { title } = req.body;
  try {
    await pool.query(
      "UPDATE chat_conversations SET title = $1, updated_at = now() WHERE id = $2 AND user_id = $3",
      [title, req.params.id, req.user!.id]
    );
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to update title" });
  }
});

router.delete("/conversations/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await pool.query("DELETE FROM chat_conversations WHERE id = $1 AND user_id = $2", [req.params.id, req.user!.id]);
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// ── Messages CRUD ──────────────────────────────────────────────────────────────
router.get("/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows: convRows } = await pool.query(
      "SELECT id FROM chat_conversations WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user!.id]
    );
    if (convRows.length === 0) return res.status(404).json({ error: "Conversation not found" });

    const { rows } = await pool.query(
      `SELECT cm.id, cm.role, cm.content, cm.created_at, cm.edited_at,
              cm.is_deleted, cm.reactions, cm.sender_id,
              u.full_name AS sender_name, u.avatar_url AS sender_avatar
       FROM chat_messages cm
       LEFT JOIN users u ON u.id = cm.sender_id
       WHERE cm.conversation_id = $1
       ORDER BY cm.created_at ASC`,
      [req.params.id]
    );
    return res.json(rows);
  } catch {
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const { role, content } = req.body;
  if (!role || !content) return res.status(400).json({ error: "role and content required" });
  try {
    const { rows: convRows } = await pool.query(
      "SELECT id FROM chat_conversations WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user!.id]
    );
    if (convRows.length === 0) return res.status(404).json({ error: "Conversation not found" });

    const { rows } = await pool.query(
      `INSERT INTO chat_messages (conversation_id, role, content, sender_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, role, content, role === "user" ? req.user!.id : null]
    );
    await pool.query(
      "UPDATE chat_conversations SET updated_at = now(), last_message_preview = $1 WHERE id = $2",
      [content.slice(0, 80), req.params.id]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to save message" });
  }
});

// Edit message
router.patch("/conversations/:convId/messages/:msgId", requireAuth, async (req: AuthRequest, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "content required" });
  try {
    const { rows } = await pool.query(
      `UPDATE chat_messages SET content = $1, edited_at = now()
       WHERE id = $2 AND sender_id = $3
       RETURNING *`,
      [content.trim(), req.params.msgId, req.user!.id]
    );
    if (rows.length === 0) return res.status(403).json({ error: "Not allowed" });
    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ error: "Failed to edit message" });
  }
});

// Soft delete message
router.delete("/conversations/:convId/messages/:msgId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE chat_messages SET is_deleted = true, content = 'This message was deleted'
       WHERE id = $1 AND sender_id = $2
       RETURNING id`,
      [req.params.msgId, req.user!.id]
    );
    if (rows.length === 0) return res.status(403).json({ error: "Not allowed" });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete message" });
  }
});

// Toggle emoji reaction
router.post("/conversations/:convId/messages/:msgId/react", requireAuth, async (req: AuthRequest, res) => {
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: "emoji required" });
  const userId = req.user!.id;
  try {
    const { rows } = await pool.query("SELECT reactions FROM chat_messages WHERE id = $1", [req.params.msgId]);
    if (rows.length === 0) return res.status(404).json({ error: "Message not found" });

    const reactions: Record<string, string[]> = rows[0].reactions || {};
    const users = reactions[emoji] || [];
    if (users.includes(userId)) {
      reactions[emoji] = users.filter(u => u !== userId);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji] = [...users, userId];
    }

    await pool.query("UPDATE chat_messages SET reactions = $1 WHERE id = $2", [JSON.stringify(reactions), req.params.msgId]);
    return res.json({ reactions });
  } catch {
    return res.status(500).json({ error: "Failed to update reaction" });
  }
});

// ── Legacy title patch ─────────────────────────────────────────────────────────
router.patch("/conversations/:id/title", requireAuth, async (req: AuthRequest, res) => {
  const { title } = req.body;
  try {
    await pool.query(
      "UPDATE chat_conversations SET title = $1, updated_at = now() WHERE id = $2 AND user_id = $3",
      [title, req.params.id, req.user!.id]
    );
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to update title" });
  }
});

export default router;
