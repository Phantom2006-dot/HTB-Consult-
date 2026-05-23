import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import { logger } from "./lib/logger.js";
import { pool, runMigrations } from "./db.js";
import { initSchema } from "./schema.js";
import authRoutes from "./routes/auth.js";
import coursesRoutes from "./routes/courses.js";
import mentorsRoutes from "./routes/mentors.js";
import enrollmentsRoutes from "./routes/enrollments.js";
import bookingsRoutes from "./routes/bookings.js";
import bookmarksRoutes from "./routes/bookmarks.js";
import categoriesRoutes from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";
import emailsRoutes from "./routes/emails.js";
import notificationsRoutes from "./routes/notifications.js";
import articlesRoutes from "./routes/articles.js";
import resourcesRoutes from "./routes/resources.js";
import certificatesRoutes from "./routes/certificates.js";
import dashboardRoutes from "./routes/dashboard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// ── Startup env audit ────────────────────────────────────────────────────────
const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET"];
const OPTIONAL_VARS = ["GROQ_API_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY", "SMTP_HOST", "FRONTEND_URL"];

logger.info("=== HTB Consults server starting ===", { NODE_ENV: process.env.NODE_ENV, PORT });

for (const v of REQUIRED_VARS) {
  if (process.env[v]) {
    logger.info(`ENV ${v}: SET`);
  } else {
    logger.error(`ENV ${v}: MISSING — server may not work correctly`);
  }
}
for (const v of OPTIONAL_VARS) {
  logger.info(`ENV ${v}: ${process.env[v] ? "SET" : "not set"}`);
}

// ── DB connectivity + auto-migration ─────────────────────────────────────────
pool.connect()
  .then(client => {
    logger.info("Database: connected successfully");
    client.release();
    return initSchema();
  })
  .then(() => runMigrations())
  .then(() => logger.info("Database: schema and migrations applied"))
  .catch(err => {
    logger.error("Database: startup error", { error: err.message });
  });

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (_origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// ── Rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP. Please wait 15 minutes and try again." },
  skip: (req) => process.env.NODE_ENV === "development",
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
  skip: (req) => process.env.NODE_ENV === "development",
});

app.use("/api/auth", authLimiter);
app.use("/api", globalLimiter);

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger[level](`${req.method} ${req.path}`, {
      status: res.statusCode,
      ms,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    });
  });
  next();
});

// ── Health checks ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── Visitor tracking (public, fire-and-forget) ────────────────────────────────
app.post("/api/track", async (req: Request, res: Response) => {
  try {
    const { session_id, page, referrer, user_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: "session_id required" });
    await pool.query(
      `INSERT INTO site_visits (session_id, page, referrer, user_id) VALUES ($1, $2, $3, $4)`,
      [String(session_id).slice(0, 64), String(page || "/").slice(0, 255), referrer ? String(referrer).slice(0, 255) : null, user_id || null]
    );
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "tracking failed" });
  }
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/mentors", mentorsRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/bookmarks", bookmarksRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/emails", emailsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/certificates", certificatesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ── Static files (production) ─────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../public");
  app.use(express.static(distPath));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  });
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const HOST = "0.0.0.0";
app.listen(Number(PORT), HOST, () => {
  logger.info(`Server listening on http://${HOST}:${PORT}`);
});
