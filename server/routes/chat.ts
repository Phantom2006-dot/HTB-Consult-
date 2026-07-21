import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
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

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

// ── AI stream ────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required." });
  }
  logger.info("AI chat request", { messageCount: messages.length });
  try {
    const contents = [
      { role: "user" as const, parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model" as const, parts: [{ text: "Understood. I'm the HTB Consults AI Assistant and I'm ready to help." }] },
      ...messages.map((m: any) => ({
        role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
        parts: [{ text: m.content }],
      })),
    ];
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: { maxOutputTokens: 8192 },
    });
    for await (const chunk of stream) {
      const text = chunk.text || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
    logger.info("AI response complete via Replit Gemini");
  } catch (err: any) {
    logger.error("Gemini AI error", { error: err.message });
    if (!res.headersSent) res.status(500).json({ error: "AI service error. Please try again." });
    else { res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`); res.end(); }
  }
});

// ── Ping (update last_seen_at) ────────────────────────────────────────────────
router.post("/ping", requireAuth, async (req: AuthRequest, res) => {
  try {
    await pool.query("UPDATE users SET last_seen_at = now() WHERE id = $1", [req.user!.id]);
    return res.json({ ok: true });
  } catch { return res.json({ ok: true }); }
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
  } catch { return res.status(500).json({ error: "Failed to fetch users" }); }
});

// ── Community channel (get or create) ────────────────────────────────────────
router.get("/community", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Look for the shared community room
    const { rows: existing } = await pool.query(
      `SELECT * FROM chat_conversations
       WHERE type = 'group' AND participant_id IS NULL AND title = 'Community'
       ORDER BY created_at ASC LIMIT 1`
    );
    if (existing.length > 0) return res.json(existing[0]);

    // Create it if it doesn't exist yet
    const { rows } = await pool.query(
      `INSERT INTO chat_conversations (user_id, title, type, participant_id)
       VALUES ($1, 'Community', 'group', NULL) RETURNING *`,
      [req.user!.id]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to get community channel" });
  }
});

// ── Conversations CRUD ─────────────────────────────────────────────────────────

// Helper: check if user can access a conversation, returns the conversation row or null
async function getAccessibleConv(convId: string, userId: string) {
  const { rows } = await pool.query(
    `SELECT * FROM chat_conversations
     WHERE id = $1
       AND (user_id = $2
            OR participant_id = $2
            OR (type = 'group' AND participant_id IS NULL))`,
    [convId, userId]
  );
  return rows[0] || null;
}

router.get("/conversations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT cc.*,
              -- "other person" depends on whether current user is owner or participant
              CASE WHEN cc.user_id = $1 THEN p.full_name  ELSE u.full_name  END AS participant_name,
              CASE WHEN cc.user_id = $1 THEN p.avatar_url ELSE u.avatar_url END AS participant_avatar,
              CASE WHEN cc.user_id = $1
                THEN (p.last_seen_at > now() - interval '5 minutes')
                ELSE (u.last_seen_at > now() - interval '5 minutes')
              END AS participant_online
       FROM chat_conversations cc
       LEFT JOIN users p ON p.id = cc.participant_id
       LEFT JOIN users u ON u.id = cc.user_id
       WHERE cc.user_id = $1
          OR cc.participant_id = $1
          OR (cc.type = 'group' AND cc.participant_id IS NULL)
       ORDER BY cc.updated_at DESC`,
      [req.user!.id]
    );
    return res.json(rows);
  } catch { return res.status(500).json({ error: "Failed to fetch conversations" }); }
});

router.post("/conversations", requireAuth, async (req: AuthRequest, res) => {
  const { title, type, participant_id } = req.body;
  try {
    // For DMs check both directions to avoid duplicate threads
    if ((type === "user") && participant_id) {
      const existing = await pool.query(
        `SELECT * FROM chat_conversations
         WHERE type = 'user'
           AND ((user_id = $1 AND participant_id = $2)
             OR (user_id = $2 AND participant_id = $1))
         LIMIT 1`,
        [req.user!.id, participant_id]
      );
      if (existing.rows.length > 0) return res.json(existing.rows[0]);
    }

    const { rows } = await pool.query(
      `INSERT INTO chat_conversations (user_id, title, type, participant_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
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
  } catch { return res.status(500).json({ error: "Failed to update title" }); }
});

router.delete("/conversations/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await pool.query(
      "DELETE FROM chat_conversations WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user!.id]
    );
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: "Failed to delete conversation" }); }
});

// ── Messages CRUD ──────────────────────────────────────────────────────────────
router.get("/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const convId = String(req.params.id);
    const conv = await getAccessibleConv(convId, req.user!.id);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const { rows } = await pool.query(
      `SELECT cm.id, cm.role, cm.content, cm.created_at, cm.edited_at,
              cm.is_deleted, cm.reactions, cm.sender_id,
              u.full_name AS sender_name, u.avatar_url AS sender_avatar
       FROM chat_messages cm
       LEFT JOIN users u ON u.id = cm.sender_id
       WHERE cm.conversation_id = $1
       ORDER BY cm.created_at ASC`,
      [convId]
    );
    return res.json(rows);
  } catch { return res.status(500).json({ error: "Failed to fetch messages" }); }
});

router.post("/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const { role, content } = req.body;
  if (!role || !content) return res.status(400).json({ error: "role and content required" });
  try {
    const convId = String(req.params.id);
    const conv = await getAccessibleConv(convId, req.user!.id);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const { rows } = await pool.query(
      `INSERT INTO chat_messages (conversation_id, role, content, sender_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [convId, role, content, role === "user" ? req.user!.id : null]
    );
    await pool.query(
      "UPDATE chat_conversations SET updated_at = now(), last_message_preview = $1 WHERE id = $2",
      [content.slice(0, 80), convId]
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
       WHERE id = $2 AND sender_id = $3 RETURNING *`,
      [content.trim(), req.params.msgId, req.user!.id]
    );
    if (rows.length === 0) return res.status(403).json({ error: "Not allowed" });
    return res.json(rows[0]);
  } catch { return res.status(500).json({ error: "Failed to edit message" }); }
});

// Soft delete message
router.delete("/conversations/:convId/messages/:msgId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE chat_messages SET is_deleted = true, content = 'This message was deleted'
       WHERE id = $1 AND sender_id = $2 RETURNING id`,
      [req.params.msgId, req.user!.id]
    );
    if (rows.length === 0) return res.status(403).json({ error: "Not allowed" });
    return res.json({ success: true });
  } catch { return res.status(500).json({ error: "Failed to delete message" }); }
});

// Toggle emoji reaction
router.post("/conversations/:convId/messages/:msgId/react", requireAuth, async (req: AuthRequest, res) => {
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: "emoji required" });
  const userId = req.user!.id;
  try {
    const convId = String(req.params.convId);
    const conv = await getAccessibleConv(convId, userId);
    if (!conv) return res.status(404).json({ error: "Not found" });

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
  } catch { return res.status(500).json({ error: "Failed to update reaction" }); }
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
  } catch { return res.status(500).json({ error: "Failed to update title" }); }
});

export default router;
