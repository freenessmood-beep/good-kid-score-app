-- Trades table (carrot redemption records)
CREATE TABLE public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  reward_item_id UUID REFERENCES public.reward_items(id) ON DELETE SET NULL,
  reward_description TEXT NOT NULL,
  carrots_spent INTEGER NOT NULL CHECK (carrots_spent >= 1),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view trades" ON public.trades
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owners can insert trades" ON public.trades
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can delete trades" ON public.trades
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );
