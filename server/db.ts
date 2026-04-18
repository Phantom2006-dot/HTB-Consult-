import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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

    // Notification read-tracking
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_notifications_viewed_at TIMESTAMPTZ;
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
