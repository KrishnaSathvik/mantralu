ALTER TABLE public.mantras 
  ADD COLUMN IF NOT EXISTS benefits_te jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS when_to_chant_te text DEFAULT NULL;