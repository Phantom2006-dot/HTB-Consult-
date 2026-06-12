import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Auto-apply any missing column migrations on startup
export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_id     UUID REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_deleted    BOOLEAN DEFAULT false;
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS edited_at     TIMESTAMPTZ;
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reactions     JSONB DEFAULT '{}';

      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now();

      ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS last_message_preview TEXT;
    `);

    // Handle the type constraint separately (can't use IF NOT EXISTS on constraints)
    await client.query(`
      DO $$
      BEGIN
        ALTER TABLE chat_conversations DROP CONSTRAINT IF EXISTS chat_conversations_type_check;
        ALTER TABLE chat_conversations ADD CONSTRAINT chat_conversations_type_check
          CHECK (type IN ('ai','user','group'));
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_msgs_sender ON chat_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_users_last_seen   ON users(last_seen_at);
      CREATE INDEX IF NOT EXISTS idx_chat_conv_updated ON chat_conversations(updated_at DESC);
    `);

    // Course locking
    await client.query(`
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
    `);

    // Course payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_payments (
        id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id              UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        amount                 NUMERIC NOT NULL,
        currency               TEXT NOT NULL DEFAULT 'GBP',
        tx_ref                 TEXT NOT NULL UNIQUE,
        gateway_transaction_id TEXT,
        gateway_amount         NUMERIC,
        gateway_currency       TEXT,
        status                 TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','successful','failed')),
        created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_course_payments_user    ON course_payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_course_payments_course  ON course_payments(course_id);
      CREATE INDEX IF NOT EXISTS idx_course_payments_status  ON course_payments(status);
    `);

    // Migrate: rename Flutterwave-specific columns to gateway-agnostic names
    await client.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'course_payments' AND column_name = 'flw_transaction_id'
        ) THEN
          ALTER TABLE course_payments RENAME COLUMN flw_transaction_id TO gateway_transaction_id;
          ALTER TABLE course_payments RENAME COLUMN flw_amount TO gateway_amount;
          ALTER TABLE course_payments RENAME COLUMN flw_currency TO gateway_currency;
        END IF;
      END $$;
    `);

    // Notification read-tracking
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_notifications_viewed_at TIMESTAMPTZ;
    `);

    // Brute-force / account lockout tracking
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
    `);

    // Sync to the 6 official course pathways (insert new, remove legacy)
    await client.query(`
      INSERT INTO categories (name) VALUES
        ('Business Analysis Foundation Bootcamp'),
        ('Personal and Leadership Development'),
        ('Mindset Before Skillset®'),
        ('Agile and Scrum'),
        ('Product Ownership'),
        ('Domain Specific Pathways')
      ON CONFLICT (name) DO NOTHING;

      DELETE FROM categories WHERE name IN (
        'Business Analysis','Digital Transformation','Business Strategy',
        'Project Delivery','Bid Writing','Consulting & Leadership','General'
      );
    `);

    // Remap any courses that still carry legacy category names
    await client.query(`
      UPDATE courses SET category = 'Business Analysis Foundation Bootcamp'
        WHERE category IN ('Business Analysis');
      UPDATE courses SET category = 'Personal and Leadership Development'
        WHERE category IN ('Consulting & Leadership');
      UPDATE courses SET category = 'Domain Specific Pathways'
        WHERE category IN ('Digital Transformation','Business Strategy','Project Delivery','Bid Writing');
      UPDATE courses SET category = 'Business Analysis Foundation Bootcamp'
        WHERE category = 'General';
    `);

    // Email verification — mark existing users as already verified so they aren't locked out
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
      UPDATE users SET email_verified = true WHERE email_verified = false;

      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

  } finally {
    client.release();
  }
}
