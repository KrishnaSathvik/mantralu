
-- Create a function to update mantra_count on categories
CREATE OR REPLACE FUNCTION public.update_category_mantra_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old category count if category changed
  IF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE public.categories SET mantra_count = (
        SELECT COUNT(*) FROM public.mantras WHERE category_id = OLD.category_id AND is_published = true
      ) WHERE id = OLD.category_id;
    END IF;
  END IF;

  -- Update new/current category count
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.category_id IS NOT NULL THEN
      UPDATE public.categories SET mantra_count = (
        SELECT COUNT(*) FROM public.mantras WHERE category_id = NEW.category_id AND is_published = true
      ) WHERE id = NEW.category_id;
    END IF;
  END IF;

  -- Update old category on delete
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_category_mantra_count ON public.mantras;
CREATE TRIGGER trigger_update_category_mantra_count
  AFTER INSERT OR UPDATE OR DELETE ON public.mantras
  FOR EACH ROW EXECUTE FUNCTION public.update_category_mantra_count();

-- Sync current counts
UPDATE public.categories SET mantra_count = (
  SELECT COUNT(*) FROM public.mantras WHERE category_id = categories.id AND is_published = true
);
