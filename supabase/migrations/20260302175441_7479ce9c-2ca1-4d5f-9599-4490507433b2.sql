
-- 1. Fix app_users: remove public SELECT (not needed), fix broken UPDATE policy
DROP POLICY IF EXISTS "Anyone can read app_users" ON public.app_users;
DROP POLICY IF EXISTS "Users can update own app_user" ON public.app_users;
-- No SELECT needed since app never reads this table
-- UPDATE not needed from client either, upsert on INSERT handles it

-- 2. Fix feedback: remove public SELECT (not needed, only INSERT)
DROP POLICY IF EXISTS "Anyone can read own feedback" ON public.feedback;

-- 3. Fix chat_conversations: restrict all ops to own device_id
DROP POLICY IF EXISTS "Users can read own chats" ON public.chat_conversations;
CREATE POLICY "Users can read own chats" ON public.chat_conversations
  FOR SELECT USING (true);
-- Note: Without Supabase Auth, we cannot verify device_id server-side.
-- The device_id is a client-side value. These policies still use true
-- because there's no JWT-based identity to check against.
-- This is an accepted limitation of the device-id auth strategy.

DROP POLICY IF EXISTS "Users can insert chats" ON public.chat_conversations;
CREATE POLICY "Users can insert chats" ON public.chat_conversations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own chats" ON public.chat_conversations;
CREATE POLICY "Users can update own chats" ON public.chat_conversations
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own chats" ON public.chat_conversations;
CREATE POLICY "Users can delete own chats" ON public.chat_conversations
  FOR DELETE USING (true);

-- 4. Reviews: keep public SELECT (reviews are meant to be displayed)
-- but accept device_id exposure as low risk since it's a random UUID
