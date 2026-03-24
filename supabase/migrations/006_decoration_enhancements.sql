-- Extend decoration_items with structured fields
ALTER TABLE public.decoration_items
  ADD COLUMN IF NOT EXISTS item_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('headwear','tops','bottoms','footwear','acc')),
  ADD COLUMN IF NOT EXISTS attachment_node TEXT,
  ADD COLUMN IF NOT EXISTS color_hex TEXT;

-- Equipment table: one equipped item per category per child
CREATE TABLE IF NOT EXISTS public.child_equipment (
  id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id           UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  category           TEXT NOT NULL,
  decoration_item_id UUID REFERENCES public.decoration_items(id) ON DELETE SET NULL,
  equipped_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, category)
);

ALTER TABLE public.child_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view equipment" ON public.child_equipment
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners can manage equipment" ON public.child_equipment
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Viewers can manage their own bunny equipment" ON public.child_equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE id = child_id AND linked_user_id = auth.uid()
    )
  );
