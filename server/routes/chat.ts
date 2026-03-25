import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const SYSTEM_PROMPT = `You are the HTB Consults AI Assistant — a helpful, professional career and training advisor for HighTicketBoss (HTB Consults). You help users with:
- Project Management training and certification guidance (PMP, PRINCE2, Agile)
- Business Analysis training and career advice (BCS, CBAP)
- CV review tips and career roadmap planning
- Mentoring session preparation
- General career development in tech and business

Be concise, encouraging, and professional. Use markdown formatting for clarity. If asked about pricing or bookings, direct users to the Services or Courses pages.`;

router.post("/", async (req, res) => {
  const { messages } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "AI API key is not configured." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return res.status(429).json({ error: "Rate limit exceeded." });
      const text = await response.text();
      console.error("AI API error:", response.status, text);
      return res.status(500).json({ error: "AI service unavailable" });
    }

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
  } catch (err: any) {
    if (!res.headersSent) res.status(500).json({ error: err.message || "Unknown error" });
  }
});

router.get("/conversations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM chat_conversations WHERE user_id = $1 ORDER BY updated_at DESC",
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
    const { rows } = await pool.query(
      "INSERT INTO chat_conversations (user_id, title, type, participant_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [req.user!.id, title || "New Chat", type || "ai", participant_id || null]
    );
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create conversation" });
  }
});

router.delete("/conversations/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await pool.query("DELETE FROM chat_conversations WHERE id = $1 AND user_id = $2", [req.params.id, req.user!.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.get("/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rows: convRows } = await pool.query(
      "SELECT id FROM chat_conversations WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user!.id]
    );
    if (convRows.length === 0) return res.status(404).json({ error: "Conversation not found" });
    const { rows } = await pool.query(
      "SELECT role, content, created_at FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [req.params.id]
    );
    return res.json(rows);
  } catch (err) {
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
      "INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1,$2,$3) RETURNING *",
      [req.params.id, role, content]
    );
    await pool.query("UPDATE chat_conversations SET updated_at = now() WHERE id = $1", [req.params.id]);
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to save message" });
  }
});

router.patch("/conversations/:id/title", requireAuth, async (req: AuthRequest, res) => {
  const { title } = req.body;
  try {
    await pool.query(
      "UPDATE chat_conversations SET title = $1, updated_at = now() WHERE id = $2 AND user_id = $3",
      [title, req.params.id, req.user!.id]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update title" });
  }
});

export default router;
