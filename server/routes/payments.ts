import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// ── Create a payment record and return tx_ref ─────────────────────────────────
router.post("/initiate", requireAuth, async (req: AuthRequest, res) => {
  const { course_id, amount, currency } = req.body;
  if (!course_id || !amount || !currency) {
    return res.status(400).json({ error: "course_id, amount, and currency are required" });
  }
  try {
    const courseRow = await pool.query(
      `SELECT id, title, price FROM courses WHERE id = $1`,
      [course_id]
    );
    if (courseRow.rows.length === 0) return res.status(404).json({ error: "Course not found" });

    const tx_ref = `HTB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { rows } = await pool.query(
      `INSERT INTO course_payments (user_id, course_id, amount, currency, tx_ref, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [req.user!.id, course_id, amount, currency, tx_ref]
    );
    return res.status(201).json({ tx_ref, payment_id: rows[0].id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to initiate payment" });
  }
});

// ── Verify payment with Flutterwave and enroll if successful ──────────────────
router.post("/verify", requireAuth, async (req: AuthRequest, res) => {
  const { tx_ref, transaction_id } = req.body;
  if (!tx_ref || !transaction_id) {
    return res.status(400).json({ error: "tx_ref and transaction_id are required" });
  }

  try {
    // Verify with Flutterwave API
    const flwRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const flwData = (await flwRes.json()) as any;

    if (!flwRes.ok || flwData.status !== "success") {
      await pool.query(
        `UPDATE course_payments SET status = 'failed', flw_transaction_id = $1, updated_at = now()
         WHERE tx_ref = $2`,
        [String(transaction_id), tx_ref]
      );
      return res.status(400).json({ error: "Payment verification failed", details: flwData.message });
    }

    const txData = flwData.data;

    // Double-check tx_ref matches and payment is complete
    if (txData.tx_ref !== tx_ref || txData.status !== "successful") {
      await pool.query(
        `UPDATE course_payments SET status = 'failed', flw_transaction_id = $1, updated_at = now()
         WHERE tx_ref = $2`,
        [String(transaction_id), tx_ref]
      );
      return res.status(400).json({ error: "Payment reference mismatch or not successful" });
    }

    // Fetch our payment record
    const paymentRow = await pool.query(
      `SELECT * FROM course_payments WHERE tx_ref = $1 AND user_id = $2`,
      [tx_ref, req.user!.id]
    );
    if (paymentRow.rows.length === 0) {
      return res.status(404).json({ error: "Payment record not found" });
    }
    const payment = paymentRow.rows[0];

    // Mark payment as successful
    await pool.query(
      `UPDATE course_payments
       SET status = 'successful', flw_transaction_id = $1, flw_amount = $2, flw_currency = $3, updated_at = now()
       WHERE tx_ref = $4`,
      [String(transaction_id), txData.amount, txData.currency, tx_ref]
    );

    // Auto-enroll the student
    await pool.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [req.user!.id, payment.course_id]
    );

    // Send in-app notification
    const courseRow = await pool.query(`SELECT title FROM courses WHERE id = $1`, [payment.course_id]);
    const courseTitle = courseRow.rows[0]?.title || "the course";
    await pool.query(
      `INSERT INTO user_notifications (user_id, type, title, body, link)
       VALUES ($1, 'success', $2, $3, $4)`,
      [
        req.user!.id,
        "🎉 Payment Confirmed — You're Enrolled!",
        `Your payment of ${txData.currency} ${txData.amount} was successful. You are now enrolled in "${courseTitle}". Start learning today!`,
        `/course/${payment.course_id}`,
      ]
    );

    return res.json({ success: true, course_id: payment.course_id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Verification error" });
  }
});

// ── Admin: get all payments ───────────────────────────────────────────────────
router.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.tx_ref, p.flw_transaction_id, p.amount, p.currency,
              p.flw_amount, p.flw_currency, p.status, p.created_at, p.updated_at,
              u.full_name, u.email,
              c.title AS course_title, c.thumbnail_url,
              e.id AS enrollment_id
       FROM course_payments p
       JOIN users u ON u.id = p.user_id
       JOIN courses c ON c.id = p.course_id
       LEFT JOIN enrollments e ON e.user_id = p.user_id AND e.course_id = p.course_id
       ORDER BY p.created_at DESC`
    );
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch payments" });
  }
});

// ── Admin: manually enroll after verifying payment offline ───────────────────
router.post("/admin/manual-enroll", requireAdmin, async (req: AuthRequest, res) => {
  const { payment_id } = req.body;
  if (!payment_id) return res.status(400).json({ error: "payment_id required" });
  try {
    const payRow = await pool.query(
      `UPDATE course_payments SET status = 'successful', updated_at = now()
       WHERE id = $1 RETURNING *`,
      [payment_id]
    );
    if (payRow.rows.length === 0) return res.status(404).json({ error: "Payment not found" });
    const p = payRow.rows[0];

    await pool.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [p.user_id, p.course_id]
    );

    // Notify student
    const courseRow = await pool.query(`SELECT title FROM courses WHERE id = $1`, [p.course_id]);
    const courseTitle = courseRow.rows[0]?.title || "the course";
    await pool.query(
      `INSERT INTO user_notifications (user_id, type, title, body, link)
       VALUES ($1, 'success', $2, $3, $4)`,
      [
        p.user_id,
        "✅ Enrollment Confirmed by Admin",
        `Your enrollment in "${courseTitle}" has been confirmed manually by our team. You can now access the course.`,
        `/course/${p.course_id}`,
      ]
    );

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Manual enroll failed" });
  }
});

export default router;
