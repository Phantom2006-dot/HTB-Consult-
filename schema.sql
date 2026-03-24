-- HTB Consult Academy — Neon DB Schema
-- Run this file in your Neon DB SQL editor or via psql:
--   psql $DATABASE_URL -f schema.sql

-- Enable pgcrypto for gen_random_bytes (used in certificates)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- USERS  (replaces Supabase auth.users + profiles)
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  full_name     TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- USER ROLES
-- =========================================================
CREATE TYPE app_role AS ENUM ('admin', 'instructor', 'student');

CREATE TABLE IF NOT EXISTS user_roles (
  id      UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role    app_role  NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);

-- =========================================================
-- CATEGORIES
-- =========================================================
CREATE TABLE IF NOT EXISTS categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- COURSES
-- =========================================================
CREATE TABLE IF NOT EXISTS courses (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  description    TEXT        NOT NULL DEFAULT '',
  category       TEXT        NOT NULL DEFAULT 'General',
  skill_level    TEXT        NOT NULL DEFAULT 'Beginner',
  price          NUMERIC     NOT NULL DEFAULT 0,
  thumbnail_url  TEXT,
  tags           TEXT[]      DEFAULT '{}',
  rating         NUMERIC     DEFAULT 0,
  total_duration TEXT        DEFAULT '',
  instructor_id  UUID        REFERENCES users(id),
  live_class_url TEXT,
  course_type    TEXT        NOT NULL DEFAULT 'video',
  published      BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- MODULES
-- =========================================================
CREATE TABLE IF NOT EXISTS modules (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- LESSONS
-- =========================================================
CREATE TABLE IF NOT EXISTS lessons (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  content_type TEXT        NOT NULL DEFAULT 'text',
  content      TEXT        DEFAULT '',
  video_url    TEXT,
  duration     TEXT        DEFAULT '',
  sort_order   INT         NOT NULL DEFAULT 0,
  is_free      BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- ENROLLMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress     NUMERIC     NOT NULL DEFAULT 0,
  completed    BOOLEAN     NOT NULL DEFAULT false,
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

-- =========================================================
-- LESSON PROGRESS
-- =========================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN     NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, lesson_id)
);

-- =========================================================
-- MENTORS
-- =========================================================
CREATE TABLE IF NOT EXISTS mentors (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  avatar_url       TEXT,
  title            TEXT        NOT NULL DEFAULT '',
  bio              TEXT        DEFAULT '',
  specializations  TEXT[]      DEFAULT '{}',
  years_experience INT         DEFAULT 0,
  rating           NUMERIC     DEFAULT 0,
  total_sessions   INT         DEFAULT 0,
  hourly_rate      NUMERIC     DEFAULT 0,
  published        BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- AVAILABILITY SLOTS
-- =========================================================
CREATE TABLE IF NOT EXISTS availability_slots (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   UUID    NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  day_of_week INT     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TIME    NOT NULL,
  end_time    TIME    NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

-- =========================================================
-- BOOKINGS
-- =========================================================
CREATE TABLE IF NOT EXISTS bookings (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id    UUID        NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  session_date DATE        NOT NULL,
  start_time   TIME        NOT NULL,
  end_time     TIME        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending',
  meeting_link TEXT,
  notes        TEXT        DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- BOOKMARKS
-- =========================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- =========================================================
-- CERTIFICATES
-- =========================================================
CREATE TABLE IF NOT EXISTS certificates (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id         UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_code TEXT        NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  UNIQUE (user_id, course_id)
);

-- =========================================================
-- CHAT CONVERSATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL DEFAULT 'New Chat',
  type           TEXT        NOT NULL DEFAULT 'ai' CHECK (type IN ('ai', 'user')),
  participant_id UUID,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- CHAT MESSAGES
-- =========================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- EMAILS
-- =========================================================
CREATE TABLE IF NOT EXISTS emails (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id      UUID        NOT NULL REFERENCES users(id),
  recipient_id   UUID        NOT NULL REFERENCES users(id),
  subject        TEXT        NOT NULL DEFAULT '',
  body           TEXT        NOT NULL DEFAULT '',
  is_read        BOOLEAN     NOT NULL DEFAULT false,
  is_draft       BOOLEAN     NOT NULL DEFAULT false,
  has_attachment BOOLEAN     NOT NULL DEFAULT false,
  folder         TEXT        NOT NULL DEFAULT 'inbox',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- SEED: Default categories
-- =========================================================
INSERT INTO categories (name) VALUES
  ('Business Analysis'),
  ('Digital Transformation'),
  ('Business Strategy'),
  ('Project Delivery'),
  ('Bid Writing'),
  ('Consulting & Leadership'),
  ('General')
ON CONFLICT (name) DO NOTHING;
