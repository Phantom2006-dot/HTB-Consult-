import { pool } from "./db.js";
import { logger } from "./lib/logger.js";

export async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email           TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL,
        full_name       TEXT,
        avatar_url      TEXT,
        bio             TEXT,
        is_blocked      BOOLEAN NOT NULL DEFAULT false,
        email_verified  BOOLEAN NOT NULL DEFAULT false,
        last_seen_at    TIMESTAMPTZ DEFAULT now(),
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS user_roles (
        id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role    TEXT NOT NULL DEFAULT 'student',
        UNIQUE (user_id, role)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS courses (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title           TEXT NOT NULL,
        description     TEXT NOT NULL DEFAULT '',
        category        TEXT NOT NULL DEFAULT 'General',
        skill_level     TEXT NOT NULL DEFAULT 'Beginner',
        price           NUMERIC NOT NULL DEFAULT 0,
        thumbnail_url   TEXT,
        tags            TEXT[] DEFAULT '{}',
        rating          NUMERIC DEFAULT 0,
        total_duration  TEXT DEFAULT '',
        instructor_id   UUID REFERENCES users(id),
        published       BOOLEAN NOT NULL DEFAULT false,
        is_locked       BOOLEAN NOT NULL DEFAULT false,
        live_class_url  TEXT,
        course_type     TEXT NOT NULL DEFAULT 'video',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS modules (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title      TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module_id    UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        title        TEXT NOT NULL,
        content_type TEXT NOT NULL DEFAULT 'text',
        content      TEXT DEFAULT '',
        video_url    TEXT,
        duration     TEXT DEFAULT '',
        sort_order   INT NOT NULL DEFAULT 0,
        is_free      BOOLEAN NOT NULL DEFAULT false,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        progress     NUMERIC NOT NULL DEFAULT 0,
        completed    BOOLEAN NOT NULL DEFAULT false,
        enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        completed_at TIMESTAMPTZ,
        UNIQUE (user_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS lesson_progress (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        completed    BOOLEAN NOT NULL DEFAULT false,
        completed_at TIMESTAMPTZ,
        UNIQUE (user_id, lesson_id)
      );

      CREATE TABLE IF NOT EXISTS mentors (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
        name             TEXT NOT NULL,
        avatar_url       TEXT,
        title            TEXT NOT NULL DEFAULT '',
        bio              TEXT DEFAULT '',
        specializations  TEXT[] DEFAULT '{}',
        years_experience INT DEFAULT 0,
        rating           NUMERIC DEFAULT 0,
        total_sessions   INT DEFAULT 0,
        hourly_rate      NUMERIC DEFAULT 0,
        published        BOOLEAN NOT NULL DEFAULT false,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS availability_slots (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mentor_id   UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
        day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        start_time  TIME NOT NULL,
        end_time    TIME NOT NULL,
        is_active   BOOLEAN NOT NULL DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mentor_id     UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
        session_date  DATE NOT NULL,
        start_time    TIME NOT NULL,
        end_time      TIME NOT NULL,
        status        TEXT NOT NULL DEFAULT 'pending',
        meeting_link  TEXT,
        notes         TEXT DEFAULT '',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        verification_code TEXT NOT NULL DEFAULT encode(gen_random_bytes(16)::bytea, 'hex'),
        UNIQUE (user_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS chat_conversations (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title                 TEXT NOT NULL DEFAULT 'New Chat',
        type                  TEXT NOT NULL DEFAULT 'ai' CHECK (type IN ('ai','user','group')),
        participant_id        UUID REFERENCES users(id) ON DELETE SET NULL,
        last_message_preview  TEXT,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        role            TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
        content         TEXT NOT NULL,
        sender_id       UUID REFERENCES users(id) ON DELETE SET NULL,
        is_deleted      BOOLEAN DEFAULT false,
        edited_at       TIMESTAMPTZ,
        reactions       JSONB DEFAULT '{}',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS emails (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject        TEXT NOT NULL DEFAULT '',
        body           TEXT NOT NULL DEFAULT '',
        is_read        BOOLEAN NOT NULL DEFAULT false,
        is_draft       BOOLEAN NOT NULL DEFAULT false,
        has_attachment BOOLEAN NOT NULL DEFAULT false,
        folder         TEXT NOT NULL DEFAULT 'inbox',
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS user_notifications (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type       TEXT NOT NULL DEFAULT 'info',
        title      TEXT NOT NULL,
        body       TEXT NOT NULL DEFAULT '',
        link       TEXT,
        is_read    BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS articles (
        id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title              TEXT NOT NULL,
        slug               TEXT NOT NULL UNIQUE,
        excerpt            TEXT DEFAULT '',
        content            TEXT NOT NULL DEFAULT '',
        cover_image_url    TEXT,
        read_time_minutes  INT DEFAULT 1,
        is_featured        BOOLEAN NOT NULL DEFAULT false,
        author_id          UUID REFERENCES users(id) ON DELETE SET NULL,
        published          BOOLEAN NOT NULL DEFAULT false,
        tags               TEXT[] DEFAULT '{}',
        created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS course_resources (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title       TEXT NOT NULL,
        file_url    TEXT NOT NULL,
        file_type   TEXT NOT NULL DEFAULT 'pptx',
        file_size   BIGINT,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used       BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // ── Runtime migrations: add new columns if missing ────────────────────────
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now();
    `);

    await client.query(`
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS next_batch_date TEXT DEFAULT '';
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS schedule         TEXT DEFAULT '';
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS whats_included   TEXT[] DEFAULT '{}';
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_name TEXT DEFAULT 'Certificate of Completion';
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT '';
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_roles_user   ON user_roles(user_id);
      CREATE INDEX IF NOT EXISTS idx_courses_published  ON courses(published);
      CREATE INDEX IF NOT EXISTS idx_enrollments_user   ON enrollments(user_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
      CREATE INDEX IF NOT EXISTS idx_chat_msgs_conv     ON chat_messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_chat_msgs_sender   ON chat_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_chat_conv_user     ON chat_conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_conv_updated  ON chat_conversations(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_user_notifs_user   ON user_notifications(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_users_last_seen    ON users(last_seen_at);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS site_visits (
        id         BIGSERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        page       TEXT NOT NULL DEFAULT '/',
        referrer   TEXT,
        user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_site_visits_created ON site_visits(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_site_visits_session ON site_visits(session_id);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS course_payments (
        id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id              UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        amount                 NUMERIC NOT NULL,
        currency               TEXT NOT NULL DEFAULT 'GBP',
        tx_ref                 TEXT NOT NULL UNIQUE,
        status                 TEXT NOT NULL DEFAULT 'pending',
        gateway_transaction_id TEXT,
        gateway_amount         NUMERIC,
        gateway_currency       TEXT,
        created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_course_payments_user   ON course_payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_course_payments_course ON course_payments(course_id);
      CREATE INDEX IF NOT EXISTS idx_course_payments_tx_ref ON course_payments(tx_ref);
    `);

    await client.query(`
      INSERT INTO categories (name) VALUES
        ('Business Analysis & Digital Transformation'),
        ('Leadership & Professional Development'),
        ('Agile, Product & Delivery Management'),
        ('Industry & Domain Specialisation')
      ON CONFLICT (name) DO NOTHING;
    `);
    /* Remove old categories that no longer exist */
    await client.query(`
      DELETE FROM categories WHERE name IN (
        'Business Analysis Foundation Bootcamp',
        'Business Analysis',
        'Personal and Leadership Development',
        'Mindset Before Skillset®',
        'Agile and Scrum',
        'Product Ownership',
        'Domain Specific Pathways'
      );
    `);

    logger.info("Schema: all tables and indexes ready");
  } finally {
    client.release();
  }
}
