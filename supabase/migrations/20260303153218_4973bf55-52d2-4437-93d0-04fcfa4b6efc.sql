
-- Allow admins to read page_views
CREATE POLICY "Admins can read page_views"
ON public.page_views
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read feedback
CREATE POLICY "Admins can read feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read app_users
CREATE POLICY "Admins can read app_users"
ON public.app_users
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read chat_conversations
CREATE POLICY "Admins can read chat_conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
