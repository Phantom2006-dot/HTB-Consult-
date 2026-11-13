import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

const allowedCountries = new Set(["United Kingdom", "Nigeria", "Other"]);
const allowedBackgrounds = new Set(["Student", "Graduate", "Career changer", "IT professional", "Other"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/interests", async (req, res) => {
  try {
    const { name, email, country, background, goal, consent, website } = req.body || {};

    // Silently accept honeypot submissions without storing them.
    if (website) return res.status(201).json({ ok: true });

    const fullName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const selectedCountry = typeof country === "string" ? country.trim() : "";
    const selectedBackground = typeof background === "string" ? background.trim() : "";
    const trimmedGoal = typeof goal === "string" ? goal.trim() : "";

    if (!fullName || fullName.length > 100) return res.status(400).json({ error: "Please enter your full name." });
    if (!emailPattern.test(normalizedEmail) || normalizedEmail.length > 254) return res.status(400).json({ error: "Please enter a valid email address." });
    if (!allowedCountries.has(selectedCountry)) return res.status(400).json({ error: "Please select your country of residence." });
    if (!allowedBackgrounds.has(selectedBackground)) return res.status(400).json({ error: "Please select your current background." });
    if (trimmedGoal.length > 1000) return res.status(400).json({ error: "Your goal is too long." });
    if (consent !== true) return res.status(400).json({ error: "Please agree to be contacted about this programme." });

    const { rows } = await pool.query(
      `INSERT INTO cybersecurity_interest_submissions (full_name, email, country, background, goal, consent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [fullName, normalizedEmail, selectedCountry, selectedBackground, trimmedGoal || null, true]
    );

    return res.status(201).json({ ok: true, submission: rows[0] });
  } catch (err) {
    console.error("Cybersecurity interest submission failed", err);
    return res.status(500).json({ error: "We could not save your response. Please try again." });
  }
});

export default router;
