-- ============================================================
-- HTB Consult Academy — Combined Migration
-- Run this in NeonDB SQL Editor AFTER the base schema.sql
-- All statements are safe to re-run (IF NOT EXISTS / DO blocks)
-- ============================================================


-- ============================================================
-- BLOCK 1 — User management additions
-- ============================================================

-- Soft-block users from the admin panel
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Online-status tracking (updated on every API ping)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now();


-- ============================================================
-- BLOCK 2 — Password reset tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- BLOCK 3 — Course resources (downloadable files per lesson)
-- ============================================================
CREATE TABLE IF NOT EXISTS course_resources (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id  UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  file_url   TEXT NOT NULL,
  file_type  TEXT DEFAULT 'document',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_resources_course  ON course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_lesson  ON course_resources(lesson_id);


-- ============================================================
-- BLOCK 4 — Chat v2: message features
-- ============================================================

-- Track which user sent each message (for user-to-user chats)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_id  UUID REFERENCES users(id) ON DELETE SET NULL;

-- Soft-delete: marks message as deleted without removing the row
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Records when a message was last edited
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS edited_at  TIMESTAMPTZ;

-- Emoji reactions stored as { "👍": ["user-uuid-1", "user-uuid-2"], ... }
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reactions  JSONB DEFAULT '{}';


-- ============================================================
-- BLOCK 5 — Chat v2: conversation features
-- ============================================================

-- Shows a preview of the latest message in the sidebar
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- Expand type to support group conversations
DO $$
BEGIN
  ALTER TABLE chat_conversations DROP CONSTRAINT IF EXISTS chat_conversations_type_check;
  ALTER TABLE chat_conversations ADD CONSTRAINT chat_conversations_type_check
    CHECK (type IN ('ai', 'user', 'group'));
EXCEPTION WHEN others THEN NULL;
END $$;


-- ============================================================
-- BLOCK 6 — New indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chat_msgs_sender    ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_users_last_seen      ON users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_chat_conv_updated    ON chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_token      ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_user       ON password_reset_tokens(user_id);


-- ============================================================
-- Done — all existing data is preserved.
-- ============================================================
