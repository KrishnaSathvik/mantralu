
-- Allow upsert on app_users (requires UPDATE policy for ON CONFLICT)
CREATE POLICY "Anyone can update app_users" ON public.app_users
  FOR UPDATE USING (true) WITH CHECK (true);
