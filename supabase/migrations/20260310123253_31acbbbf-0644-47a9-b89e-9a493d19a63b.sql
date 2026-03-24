
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  TO public
  USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed existing categories
INSERT INTO public.categories (name) VALUES
  ('Business Analysis'),
  ('Digital Transformation'),
  ('Business Strategy'),
  ('Project Delivery'),
  ('Bid Writing'),
  ('Consulting & Leadership'),
  ('General');
