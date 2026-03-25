-- 011_passcode.sql
-- Run this in the Supabase SQL editor.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS passcode text;

-- Allow users to update their own profile (e.g. set passcode)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.users FOR UPDATE TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;
