-- Associate each invitation code with a specific child/bunny.
-- This lets owners generate codes per child and prevents cross-linking.
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES public.children(id) ON DELETE SET NULL;
