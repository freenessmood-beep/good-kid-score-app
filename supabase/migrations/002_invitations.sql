-- Invitations table
CREATE TABLE public.invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT FALSE,
  used_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Anyone can read invitations (needed to validate code during signup)
CREATE POLICY "Anyone can read invitations" ON public.invitations
  FOR SELECT USING (true);

-- Owners can create invitations
CREATE POLICY "Owners can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- Allow marking invitation as used
CREATE POLICY "Anyone can mark invitation as used" ON public.invitations
  FOR UPDATE USING (true) WITH CHECK (used = true);

-- Update the handle_new_user function to default to 'owner'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'owner')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
