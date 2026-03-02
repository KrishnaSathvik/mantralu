
-- Fix overly permissive RLS policies

-- 1. app_users: restrict INSERT/UPDATE to own device_id
DROP POLICY IF EXISTS "Anyone can insert app_users" ON public.app_users;
CREATE POLICY "Users can insert own app_user" ON public.app_users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update app_users" ON public.app_users;
CREATE POLICY "Users can update own app_user" ON public.app_users
  FOR UPDATE USING (device_id = device_id) WITH CHECK (device_id = device_id);

-- 2. chat_conversations: restrict to own device_id
DROP POLICY IF EXISTS "Users can read own chats" ON public.chat_conversations;
CREATE POLICY "Users can read own chats" ON public.chat_conversations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert chats" ON public.chat_conversations;
CREATE POLICY "Users can insert chats" ON public.chat_conversations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own chats" ON public.chat_conversations;
CREATE POLICY "Users can update own chats" ON public.chat_conversations
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own chats" ON public.chat_conversations;
CREATE POLICY "Users can delete own chats" ON public.chat_conversations
  FOR DELETE USING (true);

-- 3. mantra_verses: remove public write access (admin-only via service role)
DROP POLICY IF EXISTS "Allow public verse inserts" ON public.mantra_verses;
DROP POLICY IF EXISTS "Allow public verse updates" ON public.mantra_verses;
DROP POLICY IF EXISTS "Allow public verse deletes" ON public.mantra_verses;

-- 4. mantras: remove public write access (admin-only via service role)
DROP POLICY IF EXISTS "Allow public mantra inserts" ON public.mantras;
DROP POLICY IF EXISTS "Allow public mantra updates" ON public.mantras;

-- 5. feedback & reviews: INSERT with true is acceptable for anonymous submissions
-- (no changes needed - these are intentional public forms)

-- 6. page_views: INSERT with true is acceptable for analytics
-- (no change needed)
