-- Drop the restrictive policy we just added
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

-- Create a PERMISSIVE policy so users can read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
