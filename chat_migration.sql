-- ============================================================
-- HTB Chat v2 Migration — Run in NeonDB SQL Editor
-- ============================================================

-- 1. Add new columns to chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_id     UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_deleted    BOOLEAN DEFAULT false;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS edited_at     TIMESTAMPTZ;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reactions     JSONB DEFAULT '{}';

-- 2. Add last_seen_at to users (for online status indicator)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now();

-- 3. Add last_message_preview to conversations (shows preview text in sidebar)
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- 4. Expand the type check on chat_conversations to include 'group'
ALTER TABLE chat_conversations DROP CONSTRAINT IF EXISTS chat_conversations_type_check;
ALTER TABLE chat_conversations ADD CONSTRAINT chat_conversations_type_check
  CHECK (type IN ('ai','user','group'));

-- 5. Performance indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_chat_msgs_sender   ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_users_last_seen     ON users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_chat_conv_updated   ON chat_conversations(updated_at DESC);

-- Done! All existing data is preserved.
