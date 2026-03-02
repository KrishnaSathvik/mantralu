
CREATE OR REPLACE FUNCTION public.update_category_mantra_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE public.categories SET mantra_count = (
        SELECT COUNT(*) FROM public.mantras WHERE category_id = OLD.category_id AND is_published = true
      ) WHERE id = OLD.category_id;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.category_id IS NOT NULL THEN
      UPDATE public.categories SET mantra_count = (
        SELECT COUNT(*) FROM public.mantras WHERE category_id = NEW.category_id AND is_published = true
      ) WHERE id = NEW.category_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE public.categories SET mantra_count = (
        SELECT COUNT(*) FROM public.mantras WHERE category_id = OLD.category_id AND is_published = true
      ) WHERE id = OLD.category_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
