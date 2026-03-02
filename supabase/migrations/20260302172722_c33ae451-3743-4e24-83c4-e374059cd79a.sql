
-- App users (identified by device_id since no auth)
CREATE TABLE public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app_users" ON public.app_users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert app_users" ON public.app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update app_users" ON public.app_users FOR UPDATE USING (true) WITH CHECK (true);

-- Feedback
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  user_name text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own feedback" ON public.feedback FOR SELECT USING (true);

-- Reviews (star rating + comment)
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  user_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);

-- Chat conversations (store in DB)
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chats" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Users can insert chats" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own chats" ON public.chat_conversations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete own chats" ON public.chat_conversations FOR DELETE USING (true);

-- Page views (basic analytics)
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text,
  page_path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page_views" ON public.page_views FOR INSERT WITH CHECK (true);

-- Trigger for updated_at on app_users
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on chat_conversations
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
