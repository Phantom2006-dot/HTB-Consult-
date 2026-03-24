
CREATE TABLE public.emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  is_draft boolean NOT NULL DEFAULT false,
  has_attachment boolean NOT NULL DEFAULT false,
  folder text NOT NULL DEFAULT 'inbox',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emails"
ON public.emails FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails"
ON public.emails FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails"
ON public.emails FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails"
ON public.emails FOR DELETE TO authenticated
USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;
