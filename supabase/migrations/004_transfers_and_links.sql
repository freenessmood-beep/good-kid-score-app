-- Link a viewer account to a bunny profile
ALTER TABLE public.children ADD COLUMN linked_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Update RLS on children so owners can update linked_user_id
-- (existing owner UPDATE policy already covers this)

-- Carrot transfers between bunnies
CREATE TABLE public.carrot_transfers (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  to_child_id   UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  amount        INTEGER NOT NULL CHECK (amount >= 1),
  note          TEXT,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.carrot_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view transfers" ON public.carrot_transfers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Owners can insert any transfer
CREATE POLICY "Owners can insert transfers" ON public.carrot_transfers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

-- Viewers can insert a transfer FROM their own linked bunny
CREATE POLICY "Viewers can transfer from their own bunny" ON public.carrot_transfers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE id = from_child_id AND linked_user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete transfers" ON public.carrot_transfers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );
