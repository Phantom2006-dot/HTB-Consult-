
-- 1. User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Courses
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  skill_level text NOT NULL DEFAULT 'Beginner',
  price numeric NOT NULL DEFAULT 0,
  thumbnail_url text,
  tags text[] DEFAULT '{}',
  rating numeric DEFAULT 0,
  total_duration text DEFAULT '',
  instructor_id uuid REFERENCES auth.users(id),
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin') OR instructor_id = auth.uid());
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Instructors can manage own courses" ON public.courses FOR ALL USING (instructor_id = auth.uid()) WITH CHECK (instructor_id = auth.uid());

-- 3. Modules
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules of visible courses" ON public.modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (published = true OR public.has_role(auth.uid(), 'admin') OR instructor_id = auth.uid()))
);
CREATE POLICY "Admins can manage modules" ON public.modules FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Lessons
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  content text DEFAULT '',
  video_url text,
  duration text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons of visible courses" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_id AND (c.published = true OR public.has_role(auth.uid(), 'admin') OR c.instructor_id = auth.uid())
  )
);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Enrollments
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  progress numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, course_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll themselves" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all enrollments" ON public.enrollments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 6. Lesson progress
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lesson progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Mentors
CREATE TABLE public.mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  title text NOT NULL DEFAULT '',
  bio text DEFAULT '',
  specializations text[] DEFAULT '{}',
  years_experience int DEFAULT 0,
  rating numeric DEFAULT 0,
  total_sessions int DEFAULT 0,
  hourly_rate numeric DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published mentors" ON public.mentors FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage mentors" ON public.mentors FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Availability slots
CREATE TABLE public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active slots" ON public.availability_slots FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage slots" ON public.availability_slots FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_id uuid REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
  session_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  meeting_link text,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. Bookmarks
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11. Certificates
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  verification_code text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  UNIQUE (user_id, course_id)
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can verify certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
