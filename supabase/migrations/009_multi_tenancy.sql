-- 009_multi_tenancy.sql
-- Run this in the Supabase SQL editor.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Add public_id column to children
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS public_id text;

UPDATE public.children
SET public_id = lower(regexp_replace(name, '[^a-zA-Z0-9]', '', 'g'))
                || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0')
WHERE public_id IS NULL;

ALTER TABLE public.children
  ALTER COLUMN public_id SET NOT NULL;

ALTER TABLE public.children
  DROP CONSTRAINT IF EXISTS children_public_id_unique;

ALTER TABLE public.children
  ADD CONSTRAINT children_public_id_unique UNIQUE (public_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Drop ALL existing policies on each affected table
--    (uses a loop so we don't need to know exact policy names)
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
  tables TEXT[] := ARRAY['children', 'score_entries', 'reward_items', 'trades', 'invitations'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOR r IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, t);
    END LOOP;
  END LOOP;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. children — new policies
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Owners see own children"
  ON public.children FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Public can read children"
  ON public.children FOR SELECT TO anon
  USING (true);

CREATE POLICY "Owners can insert children"
  ON public.children FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can update own children"
  ON public.children FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can delete own children"
  ON public.children FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 4. score_entries — new policies
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Owners see own score entries"
  ON public.score_entries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Public can read score entries"
  ON public.score_entries FOR SELECT TO anon
  USING (true);

CREATE POLICY "Owners can insert score entries"
  ON public.score_entries FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Owners can update own score entries"
  ON public.score_entries FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own score entries"
  ON public.score_entries FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.created_by = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 5. reward_items — new policies
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Owners see own reward items"
  ON public.reward_items FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Public can read reward items"
  ON public.reward_items FOR SELECT TO anon
  USING (true);

CREATE POLICY "Owners can insert reward items"
  ON public.reward_items FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can update own reward items"
  ON public.reward_items FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Owners can delete own reward items"
  ON public.reward_items FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- 6. trades — new policies
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Owners see own trades"
  ON public.trades FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Public can read trades"
  ON public.trades FOR SELECT TO anon
  USING (true);

CREATE POLICY "Owners can insert trades"
  ON public.trades FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own trades"
  ON public.trades FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.created_by = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 7. invitations — new policies
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Owners see own invitations"
  ON public.invitations FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Owners can insert invitations"
  ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can update own invitations"
  ON public.invitations FOR UPDATE TO authenticated
  USING (created_by = auth.uid());
