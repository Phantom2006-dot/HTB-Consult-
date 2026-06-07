import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// ── Initiate payment: create a pending record and return a unique reference ───
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

    // Generate a unique payment reference (Paystack-compatible format)
    const reference = `HTB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { rows } = await pool.query(
      `INSERT INTO course_payments (user_id, course_id, amount, currency, tx_ref, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [req.user!.id, course_id, amount, currency, reference]
    );
    return res.status(201).json({ reference, payment_id: rows[0].id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to initiate payment" });
  }
});

// ── Verify payment with Paystack and auto-enroll on success ──────────────────
router.post("/verify", requireAuth, async (req: AuthRequest, res) => {
  const { reference } = req.body;
  if (!reference) {
    return res.status(400).json({ error: "reference is required" });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Payment gateway not configured. Contact support." });
  }

  try {
    // Verify transaction with Paystack API
    const psRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const psData = (await psRes.json()) as any;

    if (!psRes.ok || !psData.status) {
      await pool.query(
        `UPDATE course_payments SET status = 'failed', updated_at = now() WHERE tx_ref = $1`,
        [reference]
      );
      return res.status(400).json({ error: "Payment verification failed", details: psData.message });
    }

    const txData = psData.data;

    // Confirm the transaction is actually successful
    if (txData.status !== "success") {
      await pool.query(
        `UPDATE course_payments
         SET status = 'failed', gateway_transaction_id = $1, updated_at = now()
         WHERE tx_ref = $2`,
        [String(txData.id), reference]
      );
      return res.status(400).json({ error: "Transaction was not successful", details: txData.gateway_response });
    }

    // Fetch our pending payment record
    const paymentRow = await pool.query(
      `SELECT * FROM course_payments WHERE tx_ref = $1 AND user_id = $2`,
      [reference, req.user!.id]
    );
    if (paymentRow.rows.length === 0) {
      return res.status(404).json({ error: "Payment record not found" });
    }
    const payment = paymentRow.rows[0];

    // Mark payment as successful with Paystack gateway details
    // Paystack returns amount in kobo/cents — store the raw gateway values
    await pool.query(
      `UPDATE course_payments
       SET status = 'successful',
           gateway_transaction_id = $1,
           gateway_amount = $2,
           gateway_currency = $3,
           updated_at = now()
       WHERE tx_ref = $4`,
      [String(txData.id), txData.amount / 100, txData.currency, reference]
    );

    // Auto-enroll the student
    await pool.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [req.user!.id, payment.course_id]
    );

    // Send in-app notification
    const courseRow = await pool.query(
      `SELECT title FROM courses WHERE id = $1`,
      [payment.course_id]
    );
    const courseTitle = courseRow.rows[0]?.title || "the course";
    const paidAmount = (txData.amount / 100).toLocaleString();
    await pool.query(
      `INSERT INTO user_notifications (user_id, type, title, body, link)
       VALUES ($1, 'success', $2, $3, $4)`,
      [
        req.user!.id,
        "🎉 Payment Confirmed — You're Enrolled!",
        `Your payment of ${txData.currency} ${paidAmount} was successful. You are now enrolled in "${courseTitle}". Start learning today!`,
        `/course/${payment.course_id}`,
      ]
    );

    return res.json({ success: true, course_id: payment.course_id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Verification error" });
  }
});

// ── Admin: list all payments ──────────────────────────────────────────────────
router.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.tx_ref, p.gateway_transaction_id, p.amount, p.currency,
              p.gateway_amount, p.gateway_currency, p.status, p.created_at, p.updated_at,
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

// ── Admin: manually confirm enrollment for offline/bank-transfer payments ─────
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
        `Your enrollment in "${courseTitle}" has been confirmed by our team. You can now access the course.`,
        `/course/${p.course_id}`,
      ]
    );

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Manual enroll failed" });
  }
});

export default router;
