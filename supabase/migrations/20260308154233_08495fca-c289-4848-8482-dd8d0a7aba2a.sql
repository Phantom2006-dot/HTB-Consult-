
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  type text NOT NULL DEFAULT 'ai' CHECK (type IN ('ai', 'user')),
  participant_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
ON public.chat_conversations FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage messages in own conversations"
ON public.chat_messages FOR ALL TO authenticated
USING (conversation_id IN (SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()))
WITH CHECK (conversation_id IN (SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
