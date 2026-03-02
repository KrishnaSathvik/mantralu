
-- 1. Create device_tokens table
CREATE TABLE public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow INSERT (device registers itself)
CREATE POLICY "Anyone can insert device_token" ON public.device_tokens
  FOR INSERT WITH CHECK (true);

-- No SELECT/UPDATE/DELETE from client (only via security definer)

-- 2. Security definer function: given a token, return the device_id
CREATE OR REPLACE FUNCTION public.get_device_id_from_token(_token text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT device_id FROM public.device_tokens WHERE token = _token LIMIT 1;
$$;

-- 3. Helper: extract token from request headers
CREATE OR REPLACE FUNCTION public.requesting_device_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_device_id_from_token(
    current_setting('request.headers', true)::json->>'x-device-token'
  );
$$;

-- 4. Update RLS policies to use the token-based identity

-- app_users: INSERT only if device_id matches token
DROP POLICY IF EXISTS "Users can insert own app_user" ON public.app_users;
CREATE POLICY "Users can insert own app_user" ON public.app_users
  FOR INSERT WITH CHECK (device_id = public.requesting_device_id());

-- chat_conversations: all ops scoped to own device_id
DROP POLICY IF EXISTS "Users can read own chats" ON public.chat_conversations;
CREATE POLICY "Users can read own chats" ON public.chat_conversations
  FOR SELECT USING (device_id = public.requesting_device_id());

DROP POLICY IF EXISTS "Users can insert chats" ON public.chat_conversations;
CREATE POLICY "Users can insert chats" ON public.chat_conversations
  FOR INSERT WITH CHECK (device_id = public.requesting_device_id());

DROP POLICY IF EXISTS "Users can update own chats" ON public.chat_conversations;
CREATE POLICY "Users can update own chats" ON public.chat_conversations
  FOR UPDATE USING (device_id = public.requesting_device_id())
  WITH CHECK (device_id = public.requesting_device_id());

DROP POLICY IF EXISTS "Users can delete own chats" ON public.chat_conversations;
CREATE POLICY "Users can delete own chats" ON public.chat_conversations
  FOR DELETE USING (device_id = public.requesting_device_id());

-- feedback: INSERT scoped to token
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
CREATE POLICY "Users can insert own feedback" ON public.feedback
  FOR INSERT WITH CHECK (device_id = public.requesting_device_id());

-- reviews: INSERT scoped to token
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews" ON public.reviews
  FOR INSERT WITH CHECK (device_id = public.requesting_device_id());

-- page_views: INSERT scoped to token
DROP POLICY IF EXISTS "Anyone can insert page_views" ON public.page_views;
CREATE POLICY "Users can insert own page_views" ON public.page_views
  FOR INSERT WITH CHECK (device_id = public.requesting_device_id());
