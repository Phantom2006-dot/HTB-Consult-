-- ============================================================
-- HTB Consult Academy — Complete NeonDB Schema
-- Run this entire script in the Neon SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USER ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('admin','instructor','mentor','student')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  skill_level    TEXT DEFAULT 'Beginner',
  course_type    TEXT DEFAULT 'video' CHECK (course_type IN ('video','live','book')),
  price          NUMERIC(10,2) DEFAULT 0,
  total_duration TEXT,
  tags           TEXT[] DEFAULT '{}',
  thumbnail_url  TEXT,
  live_class_url TEXT,
  published      BOOLEAN DEFAULT false,
  instructor_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS modules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  position   INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id  UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  content    TEXT,
  video_url  TEXT,
  duration   TEXT,
  position   INT DEFAULT 0,
  is_free    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress    INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed   BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- ============================================================
-- MENTORS
-- ============================================================
CREATE TABLE IF NOT EXISTS mentors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  title            TEXT,
  bio              TEXT,
  avatar_url       TEXT,
  specializations  TEXT[] DEFAULT '{}',
  years_experience INT DEFAULT 0,
  hourly_rate      NUMERIC(10,2) DEFAULT 0,
  rating           NUMERIC(3,2) DEFAULT 5.0,
  total_sessions   INT DEFAULT 0,
  published        BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AVAILABILITY SLOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS availability_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TEXT NOT NULL,
  end_time    TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT true
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id    UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time   TEXT NOT NULL,
  end_time     TEXT NOT NULL,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes        TEXT,
  meet_link    TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CHAT CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title          TEXT DEFAULT 'New Chat',
  type           TEXT DEFAULT 'ai' CHECK (type IN ('ai','user')),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- EMAILS
-- ============================================================
CREATE TABLE IF NOT EXISTS emails (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  subject        TEXT DEFAULT '(No subject)',
  body           TEXT DEFAULT '',
  is_read        BOOLEAN DEFAULT false,
  is_draft       BOOLEAN DEFAULT false,
  has_attachment BOOLEAN DEFAULT false,
  folder         TEXT DEFAULT 'inbox' CHECK (folder IN ('inbox','sent','drafts','trash')),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at       TIMESTAMPTZ DEFAULT now(),
  certificate_url TEXT,
  UNIQUE (user_id, course_id)
);

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_enrollments_user     ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course   ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user       ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor      ON bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student     ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_msgs_conv       ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_courses_published    ON courses(published);
CREATE INDEX IF NOT EXISTS idx_emails_user          ON emails(user_id);

-- ============================================================
-- SEED: DEFAULT CATEGORIES
-- ============================================================
INSERT INTO categories (name) VALUES
  ('Business Analysis'),
  ('Project Management'),
  ('Agile & Scrum'),
  ('Digital Transformation'),
  ('Business Strategy'),
  ('Project Delivery'),
  ('Bid Writing'),
  ('Consulting & Leadership'),
  ('Data Analysis'),
  ('Leadership'),
  ('Finance & Accounting'),
  ('Marketing'),
  ('IT & Technology'),
  ('General')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: ADMIN USER
--
--   Login email : phantom@htbconsult.com
--   Password    : Phantom2006++
--   Display name: Phantom
--
-- The password hash below is bcrypt(cost=12) of "Phantom2006++"
-- ============================================================
INSERT INTO users (email, password_hash, full_name)
VALUES (
  'phantom@htbconsult.com',
  '$2a$12$Jpx20p11LZkzowh3b6.21eVwpt6Aaflt1OB6n0vW1zqRoLgTeJnVS',
  'Phantom'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM users
WHERE email = 'phantom@htbconsult.com'
ON CONFLICT (user_id, role) DO NOTHING;
