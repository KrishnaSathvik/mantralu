-- Drop the restrictive published-only policy
DROP POLICY IF EXISTS "Published mantras are publicly readable" ON mantras;

-- Allow reading all mantras publicly (drafts visible for admin, app filters by is_published)
CREATE POLICY "Mantras are publicly readable"
  ON mantras FOR SELECT
  USING (true);

-- Allow public UPDATE of is_published for admin toggle (temporary until auth is added)
CREATE POLICY "Allow public mantra updates"
  ON mantras FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow public INSERT for seeding via edge function
CREATE POLICY "Allow public mantra inserts"
  ON mantras FOR INSERT
  WITH CHECK (true);