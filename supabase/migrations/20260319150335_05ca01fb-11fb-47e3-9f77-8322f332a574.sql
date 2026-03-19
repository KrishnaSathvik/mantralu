
-- Create rashi_phalalu table for yearly predictions
CREATE TABLE public.rashi_phalalu (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rashi_name_te TEXT NOT NULL,
  rashi_name_en TEXT NOT NULL,
  rashi_icon TEXT NOT NULL DEFAULT '♈',
  samvatsaram TEXT NOT NULL,
  year_start DATE NOT NULL,
  year_end DATE NOT NULL,
  prediction_te TEXT NOT NULL,
  prediction_en TEXT,
  remedies_te TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rashi_phalalu ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Rashi phalalu are publicly readable"
ON public.rashi_phalalu
FOR SELECT
TO public
USING (true);

-- Admin insert/update
CREATE POLICY "Admins can insert rashi_phalalu"
ON public.rashi_phalalu
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rashi_phalalu"
ON public.rashi_phalalu
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rashi_phalalu"
ON public.rashi_phalalu
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
