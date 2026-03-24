import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are the HTB Consults AI Assistant — a helpful, professional career and training advisor for HighTicketBoss (HTB Consults). You help users with:
- Project Management training and certification guidance (PMP, PRINCE2, Agile)
- Business Analysis training and career advice (BCS, CBAP)
- CV review tips and career roadmap planning
- Mentoring session preparation
- General career development in tech and business

Be concise, encouraging, and professional. Use markdown formatting for clarity. If asked about pricing or bookings, direct users to the Services or Courses pages.`;

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "AI API key is not configured. Please set OPENAI_API_KEY." });
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
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: "Rate limit exceeded. Please try again in a moment." });
      }
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
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }
});

const distPath = path.join(__dirname, "../public");
app.use(express.static(distPath));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
