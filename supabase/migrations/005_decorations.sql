-- Decoration catalog (owner-managed)
CREATE TABLE public.decoration_items (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('dress', 'hair_pin', 'necklace', 'other')),
  price_carrots INTEGER NOT NULL CHECK (price_carrots >= 1),
  emoji         TEXT NOT NULL DEFAULT '🎀',
  created_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.decoration_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view decoration items" ON public.decoration_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners can insert decoration items" ON public.decoration_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can update decoration items" ON public.decoration_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can delete decoration items" ON public.decoration_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- Child decoration purchases (one row per purchase)
CREATE TABLE public.child_decorations (
  id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id           UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  decoration_item_id UUID REFERENCES public.decoration_items(id) ON DELETE SET NULL,
  decoration_name    TEXT NOT NULL,
  price_paid         INTEGER NOT NULL CHECK (price_paid >= 1),
  purchased_at       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.child_decorations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view child decorations" ON public.child_decorations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners can insert child decorations" ON public.child_decorations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- Viewers can buy decorations for their own linked bunny
CREATE POLICY "Viewers can buy decorations for their own bunny" ON public.child_decorations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE id = child_id AND linked_user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete child decorations" ON public.child_decorations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );
