
-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Deities table
CREATE TABLE public.deities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🕉️',
  description_en TEXT,
  description_te TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deities are publicly readable" ON public.deities FOR SELECT USING (true);

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '📿',
  sort_order INTEGER NOT NULL DEFAULT 0,
  mantra_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);

-- Mantras table
CREATE TABLE public.mantras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_te TEXT NOT NULL,
  deity_id UUID REFERENCES public.deities(id),
  category_id UUID REFERENCES public.categories(id),
  telugu_text TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  meaning_en TEXT NOT NULL,
  meaning_te TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  when_to_chant TEXT,
  chant_count INTEGER,
  source_ref TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mantras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published mantras are publicly readable" ON public.mantras FOR SELECT USING (is_published = true);

CREATE TRIGGER update_mantras_updated_at
  BEFORE UPDATE ON public.mantras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mantras_deity ON public.mantras(deity_id);
CREATE INDEX idx_mantras_category ON public.mantras(category_id);
CREATE INDEX idx_mantras_slug ON public.mantras(slug);
CREATE INDEX idx_mantras_tags ON public.mantras USING GIN(tags);

-- Mantra verses table (for long stotras)
CREATE TABLE public.mantra_verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mantra_id UUID NOT NULL REFERENCES public.mantras(id) ON DELETE CASCADE,
  verse_number INTEGER NOT NULL,
  telugu TEXT NOT NULL,
  transliteration TEXT,
  meaning_en TEXT,
  meaning_te TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mantra_verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mantra verses are publicly readable" ON public.mantra_verses FOR SELECT USING (true);

CREATE INDEX idx_mantra_verses_mantra ON public.mantra_verses(mantra_id, verse_number);
