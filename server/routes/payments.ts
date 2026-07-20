import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";
import { getUncachableStripeClient } from "../stripeClient.js";

const router = Router();

// ── Create Stripe Checkout Session ────────────────────────────────────────────
router.post("/create-checkout-session", requireAuth, async (req: AuthRequest, res) => {
  const { course_id } = req.body;
  if (!course_id) return res.status(400).json({ error: "course_id is required" });

  try {
    const courseRow = await pool.query(
      `SELECT id, title, price, thumbnail_url FROM courses WHERE id = $1 AND published = true`,
      [course_id]
    );
    if (courseRow.rows.length === 0) return res.status(404).json({ error: "Course not found" });
    const course = courseRow.rows[0];

    // Check not already enrolled
    const enrolled = await pool.query(
      `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2`,
      [req.user!.id, course_id]
    );
    if (enrolled.rows.length > 0) {
      return res.status(400).json({ error: "You are already enrolled in this course" });
    }

    const stripe = await getUncachableStripeClient();

    // Amount in pence (GBP) — price is stored in pounds
    const amountPence = Math.round(Number(course.price) * 100);

    const origin = process.env.FRONTEND_URL ||
      `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}` ||
      "http://localhost:5000";

    const reference = `HTB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: amountPence,
            product_data: {
              name: course.title,
              images: course.thumbnail_url ? [course.thumbnail_url] : [],
              metadata: { course_id },
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        course_id,
        user_id: req.user!.id,
        reference,
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/course/${course_id}?payment=cancelled`,
    });

    // Record pending payment
    await pool.query(
      `INSERT INTO course_payments (user_id, course_id, amount, currency, tx_ref, status, gateway_transaction_id)
       VALUES ($1, $2, $3, 'GBP', $4, 'pending', $5)`,
      [req.user!.id, course_id, course.price, reference, session.id]
    );

    return res.json({ url: session.url, session_id: session.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create checkout session" });
  }
});

// ── Verify Stripe Session after redirect ──────────────────────────────────────
router.post("/verify-session", requireAuth, async (req: AuthRequest, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: "session_id is required" });

  try {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const course_id = session.metadata?.course_id;
    const user_id = session.metadata?.user_id;

    if (!course_id || user_id !== req.user!.id) {
      return res.status(403).json({ error: "Session does not belong to this user" });
    }

    // Mark payment successful
    await pool.query(
      `UPDATE course_payments
       SET status = 'successful',
           gateway_amount = $1,
           gateway_currency = 'GBP',
           updated_at = now()
       WHERE gateway_transaction_id = $2`,
      [session.amount_total ? session.amount_total / 100 : null, session_id]
    );

    // Auto-enroll
    await pool.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [req.user!.id, course_id]
    );

    // In-app notification
    const courseRow = await pool.query(`SELECT title FROM courses WHERE id = $1`, [course_id]);
    const courseTitle = courseRow.rows[0]?.title || "the course";
    const paidAmount = session.amount_total ? (session.amount_total / 100).toLocaleString() : "";
    await pool.query(
      `INSERT INTO user_notifications (user_id, type, title, body, link)
       VALUES ($1, 'success', $2, $3, $4)`,
      [
        req.user!.id,
        "🎉 Payment Confirmed — You're Enrolled!",
        `Your payment of £${paidAmount} GBP was successful. You are now enrolled in "${courseTitle}". Start learning today!`,
        `/course/${course_id}`,
      ]
    );

    return res.json({ success: true, course_id });
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

// ── Admin: manually confirm enrollment ────────────────────────────────────────
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
