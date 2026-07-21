import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";
import { getUncachableStripeClient } from "../stripeClient.js";
import { logger } from "../lib/logger.js";

const router = Router();

// ── Create Stripe Checkout Session ────────────────────────────────────────────
router.post("/create-checkout-session", requireAuth, async (req: AuthRequest, res) => {
  const { course_id } = req.body;
  const userId = req.user?.id;
  logger.info("PAYMENT [1/5] checkout requested", { course_id, user_id: userId });

  if (!course_id) {
    logger.warn("PAYMENT error: missing course_id");
    return res.status(400).json({ error: "course_id is required" });
  }

  try {
    // ── Step 1: fetch course ────────────────────────────────────────────────
    const courseRow = await pool.query(
      `SELECT id, title, price, thumbnail_url FROM courses WHERE id = $1 AND published = true`,
      [course_id]
    );
    if (courseRow.rows.length === 0) {
      logger.warn("PAYMENT error: course not found or unpublished", { course_id });
      return res.status(404).json({ error: "Course not found" });
    }
    const course = courseRow.rows[0];
    logger.info("PAYMENT [2/5] course found", { course_id, title: course.title, price: course.price });

    // ── Step 2: check existing enrollment ──────────────────────────────────
    const enrolled = await pool.query(
      `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2`,
      [userId, course_id]
    );
    if (enrolled.rows.length > 0) {
      logger.warn("PAYMENT error: user already enrolled", { course_id, user_id: userId });
      return res.status(400).json({ error: "You are already enrolled in this course" });
    }

    // ── Step 3: init Stripe ─────────────────────────────────────────────────
    logger.info("PAYMENT [3/5] initialising Stripe client");
    const stripe = await getUncachableStripeClient();

    const amountPence = Math.round(Number(course.price) * 100);
    const origin = process.env.FRONTEND_URL ||
      `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}` ||
      "http://localhost:5000";
    const reference = `HTB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    logger.info("PAYMENT [4/5] creating Stripe checkout session", {
      amount_pence: amountPence,
      currency: "gbp",
      reference,
      success_url: `${origin}/payment/success`,
      cancel_url: `${origin}/course/${course_id}`,
    });

    // ── Step 4: create Stripe session ──────────────────────────────────────
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
      metadata: { course_id, user_id: userId!, reference },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/course/${course_id}?payment=cancelled`,
    });
    logger.info("PAYMENT [5/5] Stripe session created — redirecting user", { session_id: session.id });

    // ── Step 5: record pending payment ─────────────────────────────────────
    await pool.query(
      `INSERT INTO course_payments (user_id, course_id, amount, currency, tx_ref, status, gateway_transaction_id)
       VALUES ($1, $2, $3, 'GBP', $4, 'pending', $5)`,
      [userId, course_id, course.price, reference, session.id]
    );

    return res.json({ url: session.url, session_id: session.id });
  } catch (err: any) {
    logger.error("PAYMENT ERROR in create-checkout-session", {
      message: err.message,
      type: err.type,           // Stripe error type e.g. StripeAuthenticationError
      code: err.code,           // Stripe error code e.g. api_key_invalid
      statusCode: err.statusCode,
      stack: err.stack?.split("\n").slice(0, 4).join(" | "),
    });
    return res.status(500).json({ error: err.message || "Failed to create checkout session" });
  }
});

// ── Verify Stripe Session after redirect ──────────────────────────────────────
router.post("/verify-session", requireAuth, async (req: AuthRequest, res) => {
  const { session_id } = req.body;
  const userId = req.user?.id;
  logger.info("VERIFY [1/4] session verification requested", { session_id, user_id: userId });

  if (!session_id) {
    logger.warn("VERIFY error: missing session_id");
    return res.status(400).json({ error: "session_id is required" });
  }

  try {
    const stripe = await getUncachableStripeClient();
    logger.info("VERIFY [2/4] retrieving Stripe session", { session_id });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logger.info("VERIFY Stripe session retrieved", {
      session_id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      metadata: session.metadata,
    });

    if (session.payment_status !== "paid") {
      logger.warn("VERIFY error: payment not completed", { payment_status: session.payment_status, session_id });
      return res.status(400).json({ error: "Payment not completed" });
    }

    const course_id = session.metadata?.course_id;
    const user_id = session.metadata?.user_id;

    if (!course_id || user_id !== userId) {
      logger.warn("VERIFY error: session owner mismatch", { session_user: user_id, request_user: userId });
      return res.status(403).json({ error: "Session does not belong to this user" });
    }

    logger.info("VERIFY [3/4] enrolling user", { user_id: userId, course_id });

    await pool.query(
      `UPDATE course_payments
       SET status = 'successful',
           gateway_amount = $1,
           gateway_currency = 'GBP',
           updated_at = now()
       WHERE gateway_transaction_id = $2`,
      [session.amount_total ? session.amount_total / 100 : null, session_id]
    );

    await pool.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [userId, course_id]
    );

    const courseRow = await pool.query(`SELECT title FROM courses WHERE id = $1`, [course_id]);
    const courseTitle = courseRow.rows[0]?.title || "the course";
    const paidAmount = session.amount_total ? (session.amount_total / 100).toLocaleString() : "";
    await pool.query(
      `INSERT INTO user_notifications (user_id, type, title, body, link)
       VALUES ($1, 'success', $2, $3, $4)`,
      [
        userId,
        "🎉 Payment Confirmed — You're Enrolled!",
        `Your payment of £${paidAmount} GBP was successful. You are now enrolled in "${courseTitle}". Start learning today!`,
        `/course/${course_id}`,
      ]
    );

    logger.info("VERIFY [4/4] enrollment complete", { user_id: userId, course_id, course: courseTitle });
    return res.json({ success: true, course_id });
  } catch (err: any) {
    logger.error("VERIFY ERROR in verify-session", {
      message: err.message,
      type: err.type,
      code: err.code,
      statusCode: err.statusCode,
      stack: err.stack?.split("\n").slice(0, 4).join(" | "),
    });
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
