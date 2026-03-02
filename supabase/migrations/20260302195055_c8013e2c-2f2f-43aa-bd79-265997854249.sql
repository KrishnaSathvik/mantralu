
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can read user_roles
CREATE POLICY "Admins can read user_roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin write policies for mantras
CREATE POLICY "Admins can insert mantras"
ON public.mantras FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mantras"
ON public.mantras FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete mantras"
ON public.mantras FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin write policies for categories
CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin write policies for deities
CREATE POLICY "Admins can insert deities"
ON public.deities FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update deities"
ON public.deities FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin write policies for mantra_verses
CREATE POLICY "Admins can insert mantra_verses"
ON public.mantra_verses FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mantra_verses"
ON public.mantra_verses FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete mantra_verses"
ON public.mantra_verses FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
