import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors({
  origin: (_origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

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

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../public");
  app.use(express.static(distPath));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const HOST = "0.0.0.0";
app.listen(Number(PORT), HOST, () => {
  console.log(`HTB Consults server running on http://${HOST}:${PORT}`);
});
