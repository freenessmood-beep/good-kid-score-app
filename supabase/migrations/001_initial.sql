-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'viewer')),
  avatar_color TEXT DEFAULT '#FFB7C5',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children (Bunny Profiles) table
CREATE TABLE public.children (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  bunny_color TEXT NOT NULL DEFAULT '#FFB7C5',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Score Entries table
CREATE TABLE public.score_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  points INTEGER NOT NULL CHECK (points >= 1),
  note TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward Items table
CREATE TABLE public.reward_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  carrot_threshold INTEGER NOT NULL CHECK (carrot_threshold >= 1),
  reward_description TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Owners can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for children table
CREATE POLICY "All authenticated users can view children" ON public.children
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners can insert children" ON public.children
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can update children" ON public.children
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete children" ON public.children
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for score_entries table
CREATE POLICY "All authenticated users can view score entries" ON public.score_entries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners can insert score entries" ON public.score_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can update score entries" ON public.score_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete score entries" ON public.score_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for reward_items table
CREATE POLICY "All authenticated users can view reward items" ON public.reward_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners can insert reward items" ON public.reward_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can update reward items" ON public.reward_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete reward items" ON public.reward_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
