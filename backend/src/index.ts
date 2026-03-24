import "dotenv/config";
import express from "express";
import cors from "cors";

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

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";

app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5000", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`HTB Backend running on port ${PORT}`);
});
