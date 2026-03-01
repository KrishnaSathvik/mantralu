-- Allow public inserts, updates, and deletes on mantra_verses (admin use)
CREATE POLICY "Allow public verse inserts" ON public.mantra_verses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public verse updates" ON public.mantra_verses
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public verse deletes" ON public.mantra_verses
  FOR DELETE USING (true);