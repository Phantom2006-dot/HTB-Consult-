-- ============================================================
-- HTB Consult Academy — Full Database Export
-- Generated: 2026-03-30
-- Target: NeonDB (PostgreSQL 15+)
-- Run this entire script in the Neon SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SCHEMA
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

CREATE TABLE IF NOT EXISTS user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('admin','instructor','mentor','student')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  skill_level    TEXT DEFAULT 'Beginner',
  course_type    TEXT DEFAULT 'video' CHECK (course_type IN ('video','live','book')),
  price          NUMERIC(10,2) DEFAULT 0,
  rating         NUMERIC(3,2) DEFAULT 0,
  total_duration TEXT,
  tags           TEXT[] DEFAULT '{}',
  thumbnail_url  TEXT,
  live_class_url TEXT,
  published      BOOLEAN DEFAULT false,
  instructor_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  position   INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, course_id)
);

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

CREATE TABLE IF NOT EXISTS availability_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TEXT NOT NULL,
  end_time    TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT true
);

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

CREATE TABLE IF NOT EXISTS chat_conversations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title          TEXT DEFAULT 'New Chat',
  type           TEXT DEFAULT 'ai' CHECK (type IN ('ai','user')),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at       TIMESTAMPTZ DEFAULT now(),
  certificate_url TEXT,
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS articles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  excerpt          TEXT,
  content          TEXT NOT NULL DEFAULT '',
  cover_image_url  TEXT,
  author_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  read_time_minutes INT DEFAULT 1,
  published        BOOLEAN DEFAULT false,
  is_featured      BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_reads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, article_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_enrollments_user     ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course   ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user       ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor      ON bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student     ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_msgs_conv       ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_courses_published    ON courses(published);
CREATE INDEX IF NOT EXISTS idx_emails_user          ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug        ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published   ON articles(published);

-- ============================================================
-- DATA — CATEGORIES (14)
-- ============================================================
INSERT INTO categories (id, name, created_at) VALUES
  ('3cbc8a41-9d70-4250-ae50-fad5d141ccaf', 'Agile & Scrum',          '2026-03-30 07:47:01.027419+00'),
  ('66deaa69-a8c6-4c9d-90f1-13fff3f49ec2', 'Bid Writing',             '2026-03-30 07:47:01.027419+00'),
  ('bd424481-1f76-48d8-b64e-7a491f9bbeca', 'Business Analysis',       '2026-03-30 07:47:01.027419+00'),
  ('5b170d91-be20-4b2c-a5d8-c82078fc5b6d', 'Business Strategy',       '2026-03-30 07:47:01.027419+00'),
  ('e4bd45a3-5154-466a-82e3-3435a55117ea', 'Consulting & Leadership',  '2026-03-30 07:47:01.027419+00'),
  ('9c9927b5-7147-4617-a7da-90235ee12aee', 'Data Analysis',            '2026-03-30 07:47:01.027419+00'),
  ('e8e7e256-9346-48ea-afda-0d35f38d5616', 'Digital Transformation',   '2026-03-30 07:47:01.027419+00'),
  ('2b095953-dc74-4638-a66a-aeb3655ff241', 'Finance & Accounting',     '2026-03-30 07:47:01.027419+00'),
  ('55a1d86b-5fdf-4a86-9c6d-9fd517ff1401', 'General',                  '2026-03-30 07:47:01.027419+00'),
  ('1b29818d-0b88-4fdc-86a0-d77df7819f29', 'IT & Technology',          '2026-03-30 07:47:01.027419+00'),
  ('9c09ea4e-5356-4d52-9ffd-2a226009efcf', 'Leadership',               '2026-03-30 07:47:01.027419+00'),
  ('fe5535d2-8a35-45b3-a09e-1cce99cf0924', 'Marketing',                '2026-03-30 07:47:01.027419+00'),
  ('56be158c-90b9-4125-8e00-7ea05136d9c5', 'Project Delivery',         '2026-03-30 07:47:01.027419+00'),
  ('76e705af-695d-45f9-965c-0759acdf2613', 'Project Management',       '2026-03-30 07:47:01.027419+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DATA — USERS (3)
-- Passwords:
--   phantom@htbconsult.com  → Phantom2006++
--   admin@htbconsult.com    → HTBAdmin2026!
--   mybusinessa98@gmail.com → (unknown — user must reset)
-- ============================================================
INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at) VALUES
  (
    'adbc9a1f-cc12-44d0-8cd4-b7d7a1889eb3',
    'phantom@htbconsult.com',
    '$2a$12$Jpx20p11LZkzowh3b6.21eVwpt6Aaflt1OB6n0vW1zqRoLgTeJnVS',
    'Phantom',
    '2026-03-30 07:47:01.032306+00',
    '2026-03-30 07:47:01.032306+00'
  ),
  (
    'bac2e81b-f72b-4de5-a8c9-66f6165004db',
    'mybusinessa98@gmail.com',
    '$2b$12$JKIzUtVZYUrcF0Qca/TMWOn59Vwd5q3TZ63zxJT2G1Wh72ky6ntN.',
    'daniel',
    '2026-03-30 07:58:48.273743+00',
    '2026-03-30 07:58:48.273743+00'
  ),
  (
    '50b41f9d-3fb3-4aa2-b08e-48283c2c7cc6',
    'admin@htbconsult.com',
    '$2b$12$FsZi4vOkwZaDRxKgxAuPgu0RMTabiJITXMrpPXvfqgISsuUV9s4dq',
    'HTB Admin',
    '2026-03-30 08:15:40.017857+00',
    '2026-03-30 08:15:40.017857+00'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DATA — USER ROLES
-- ============================================================
INSERT INTO user_roles (user_id, role, created_at) VALUES
  ('adbc9a1f-cc12-44d0-8cd4-b7d7a1889eb3', 'admin',   '2026-03-30 07:47:01.036401+00'),
  ('bac2e81b-f72b-4de5-a8c9-66f6165004db', 'student',  '2026-03-30 07:58:48.432201+00'),
  ('50b41f9d-3fb3-4aa2-b08e-48283c2c7cc6', 'admin',    '2026-03-30 08:15:48.15424+00')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================
-- DATA — COURSES (19)
-- ============================================================
INSERT INTO courses (id, title, description, category, skill_level, course_type, price, rating, total_duration, tags, published, created_at) VALUES
  (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'BCS International Diploma in Business Analysis',
    'Official BCS International Diploma in Business Analysis. Learn requirements engineering, stakeholder analysis, and more.',
    'Business Analysis', 'Beginner', 'live', 0.00, 4.80, '30 hours',
    ARRAY['BCS','Business Analysis','Requirements'], true, '2026-03-30 08:17:15.085681+00'
  ),
  (
    'c6dcd003-fa13-445b-b83a-e811d92fccd7',
    'User Stories and Agile Requirements',
    'Bridge the gap between traditional requirements and Agile delivery. Learn to write effective user stories, acceptance criteria, and manage product backlogs in Agile environments.',
    'Business Analysis', 'Intermediate', 'video', 45.00, 0.00, '6 hours',
    ARRAY['Agile','User Stories','Product Backlog'], true, '2026-03-30 08:17:19.038615+00'
  ),
  (
    '3bec5877-1ead-44ee-8a5c-5686801d5e0c',
    'Digital Transformation Strategy',
    'Understand how to plan, lead, and execute digital transformation initiatives. Covers digital maturity assessment, technology selection, change management, and measuring transformation success.',
    'Digital Transformation', 'Intermediate', 'video', 59.00, 0.00, '10 hours',
    ARRAY['Digital Transformation','Strategy','Change Management'], true, '2026-03-30 08:17:22.920053+00'
  ),
  (
    '7cdfa195-d699-44d8-9733-a1f8e1a47f14',
    'AI in Business Operations',
    'Explore practical applications of artificial intelligence in business. Learn how AI can automate processes, enhance decision-making, and create competitive advantages across industries.',
    'Digital Transformation', 'Beginner', 'video', 49.00, 0.00, '8 hours',
    ARRAY['AI','Automation','Machine Learning'], true, '2026-03-30 08:17:26.713282+00'
  ),
  (
    'fbd26343-808e-4781-9947-cad6ba942d8c',
    'Data Driven Decision Making',
    'Develop the skills to leverage data for strategic business decisions. Covers data literacy, analytics frameworks, KPI design, dashboarding, and building a data-driven culture.',
    'Digital Transformation', 'Beginner', 'video', 39.00, 0.00, '7 hours',
    ARRAY['Data Analytics','KPIs','Business Intelligence'], true, '2026-03-30 08:17:30.628319+00'
  ),
  (
    '3a4da74b-3382-49b4-a34a-5af65256b1bb',
    'Business Model Design',
    'Master the tools and techniques for designing, testing, and iterating business models. Covers Business Model Canvas, value proposition design, and lean startup principles.',
    'Business Strategy', 'Beginner', 'video', 45.00, 0.00, '6 hours',
    ARRAY['Business Model Canvas','Value Proposition','Lean Startup'], true, '2026-03-30 08:17:34.441834+00'
  ),
  (
    '655b59a0-b149-465f-9b02-9ab243e33068',
    'Foundations of Project Management',
    'A thorough grounding in project management principles, methodologies, and tools. Covers project lifecycle, scope, time, cost, quality, and stakeholder management fundamentals.',
    'Project Delivery', 'Beginner', 'video', 0.00, 0.00, '14 hours',
    ARRAY['Project Management','PRINCE2','PMI'], true, '2026-03-30 08:17:38.33969+00'
  ),
  (
    'cc15db3f-9259-4646-83e3-0433191707c5',
    'Agile Project Delivery',
    'Learn to deliver projects using Agile methodologies including Scrum, Kanban, and hybrid approaches. Covers sprint planning, retrospectives, and scaling Agile across teams.',
    'Project Delivery', 'Intermediate', 'video', 49.00, 0.00, '10 hours',
    ARRAY['Agile','Scrum','Kanban'], true, '2026-03-30 08:17:42.172756+00'
  ),
  (
    '36628239-c892-4cd0-af44-6b41079d1dc8',
    'Project Planning and Execution',
    'Deep dive into project planning techniques including work breakdown structures, scheduling, resource allocation, and execution monitoring for successful project delivery.',
    'Project Delivery', 'Intermediate', 'video', 45.00, 0.00, '8 hours',
    ARRAY['Planning','WBS','Scheduling'], true, '2026-03-30 08:17:46.045902+00'
  ),
  (
    '9ee6e8ad-ef51-4ae5-9893-eb565f9ed633',
    'Risk Management in Projects',
    'Identify, assess, and mitigate project risks effectively. Covers risk registers, qualitative and quantitative analysis, response strategies, and risk monitoring throughout the project lifecycle.',
    'Project Delivery', 'Advanced', 'video', 55.00, 0.00, '7 hours',
    ARRAY['Risk Management','Risk Analysis','Mitigation'], true, '2026-03-30 08:17:49.86299+00'
  ),
  (
    'dd915d0e-5798-4529-9d4e-fc34d4889921',
    'Project Governance and Reporting',
    'Establish effective governance frameworks and reporting mechanisms for project oversight. Covers steering committees, stage gates, status reporting, and benefits realisation.',
    'Project Delivery', 'Advanced', 'video', 49.00, 0.00, '6 hours',
    ARRAY['Governance','Reporting','Benefits Realisation'], true, '2026-03-30 08:17:53.865426+00'
  ),
  (
    'cd459a55-43a9-434d-b658-38cb5a7cc046',
    'Bid Writing Fundamentals',
    'Learn to craft compelling, winning bids and proposals. Covers bid strategy, compliance matrices, persuasive writing techniques, pricing strategies, and quality review processes.',
    'Bid Writing', 'Beginner', 'video', 39.00, 0.00, '6 hours',
    ARRAY['Bid Writing','Proposals','Procurement'], true, '2026-03-30 08:17:57.883554+00'
  ),
  (
    '53f40282-7131-4ed3-9ad0-55a8665e63e5',
    'Building a Consulting Practice',
    'Practical guidance on establishing and growing a successful consulting business. Covers positioning, client acquisition, delivery frameworks, pricing models, and scaling your practice.',
    'Consulting & Leadership', 'Intermediate', 'video', 59.00, 0.00, '8 hours',
    ARRAY['Consulting','Business Development','Practice Management'], true, '2026-03-30 08:18:01.778226+00'
  ),
  (
    'b0d850f6-e24c-4318-8516-3a949274e6b0',
    'Stakeholder Management for Complex Projects',
    'Master the techniques for identifying, engaging, and managing stakeholders in complex transformation programmes. Covers influence mapping, communication planning, and conflict resolution.',
    'Consulting & Leadership', 'Intermediate', 'video', 49.00, 0.00, '6 hours',
    ARRAY['Stakeholder Management','Communication','Influence'], true, '2026-03-30 08:18:05.600687+00'
  ),
  (
    '0903bb1b-eda2-498d-b7c1-f12b174d7701',
    'Strategic Planning for Business Growth',
    'This course provides a structured approach to developing and implementing strategies that support sustainable business growth. Learners will explore how to assess opportunities, define strategic objectives, and create clear plans that guide decision making, resource alignment, and long term organisational performance.',
    'Business Strategy', 'Intermediate', 'video', 55.00, 0.00, '9 hours',
    ARRAY['Strategy','Growth','Market Analysis'], true, '2026-03-30 08:18:09.422468+00'
  ),
  (
    '0f73b856-b800-46a7-a9ac-a3632e6322db',
    'Requirements Engineering for Business Analysts',
    'Master the art of eliciting, documenting, and managing requirements. Covers stakeholder interviews, workshops, use cases, and requirements traceability for successful project delivery.',
    'Business Analysis', 'Intermediate', 'video', 49.00, 0.00, '10 hours',
    ARRAY['Requirements','Elicitation','Documentation'], true, '2026-03-30 08:18:13.280066+00'
  ),
  (
    '2bdc9626-b949-4e65-bd1c-9149c1b7dee5',
    'Process Mapping and BPMN Fundamentals',
    'Learn to visualise and optimise business processes using industry-standard BPMN notation. Understand process flows, swimlanes, gateways, and how to identify improvement opportunities.',
    'Business Analysis', 'Beginner', 'video', 39.00, 0.00, '8 hours',
    ARRAY['BPMN','Process Mapping','Process Improvement'], true, '2026-03-30 08:18:17.201919+00'
  ),
  (
    'e22f9dad-2867-4941-a520-18bc8e3db625',
    'Foundations of Business Analysis',
    'This course introduces the core principles and practices of business analysis. Learners will explore how to identify business needs, gather and document requirements, and support organisations in improving processes, systems, and decision making. The course provides a practical foundation for understanding how business analysts contribute to successful project and business outcomes.',
    'Business Analysis', 'Beginner', 'video', 0.00, 0.00, '10 hours',
    ARRAY['Business Analysis','Requirements','Process Improvement'], true, '2026-03-30 08:18:21.058858+00'
  ),
  (
    '24d8c897-2555-4fa9-af55-d6a626da3aed',
    'Data Analysis',
    'This course introduces the fundamentals of data analysis and how data can be used to support informed business decisions. Participants will learn how to collect, organise, interpret and present data using practical tools and analytical techniques. The course also explores how businesses use data insights to improve performance, identify trends and support strategic planning.',
    'Data Analysis', 'Beginner', 'video', 0.00, 0.00, '8 hours',
    ARRAY['Data Analysis','Data Visualisation','Business Intelligence'], true, '2026-03-30 08:18:25.190319+00'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DATA — ARTICLES (sample article from testing)
-- ============================================================
INSERT INTO articles (id, title, slug, excerpt, content, cover_image_url, author_id, read_time_minutes, published, is_featured, created_at) VALUES
  (
    '98efb064-99e7-432b-bf90-ca8ab7ead5b4',
    'i am Phantom',
    'i-am-phantom',
    'who is Phantom',
    'well i am Phantom, the pahantomer, now forthe gebrish part

Lorem ipsum dolor, sit amet consectetur adipisicing elit. Distinctio nostrum reiciendis quasi itaque eius est! Odit rerum a aperiam nostrum. Et, itaque nostrum. Suscipit quam provident distinctio cumque quia ullam harum, eligendi recusandae, excepturi quaerat deleniti deserunt, sunt in repudiandae?',
    'https://res.cloudinary.com/di2u0n1qj/image/upload/v1774859088/htb-academy/b98k6kvcvjfouc1a3nie.png',
    '50b41f9d-3fb3-4aa2-b08e-48283c2c7cc6',
    1, true, true,
    '2026-03-30 08:24:55.086327+00'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- END OF EXPORT
-- ============================================================
