-- 010_earning_rules.sql
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.earning_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  carrots integer NOT NULL CHECK (carrots > 0),
  description text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.earning_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners see own earning rules"
  ON public.earning_rules FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Public can read earning rules"
  ON public.earning_rules FOR SELECT TO anon
  USING (true);

CREATE POLICY "Owners can insert earning rules"
  ON public.earning_rules FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can update own earning rules"
  ON public.earning_rules FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Owners can delete own earning rules"
  ON public.earning_rules FOR DELETE TO authenticated
  USING (created_by = auth.uid());
