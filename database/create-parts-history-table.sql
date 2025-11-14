-- Vytvoriť tabuľku pre históriu zmien náhradných dielov
CREATE TABLE IF NOT EXISTS public.spare_parts_history (
  id TEXT PRIMARY KEY DEFAULT ('history-' || uuid_generate_v4()),
  part_id TEXT NOT NULL REFERENCES public.spare_parts(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('increase', 'decrease', 'set')),
  notes TEXT,
  changed_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexy
CREATE INDEX IF NOT EXISTS spare_parts_history_part_id_idx ON public.spare_parts_history(part_id);
CREATE INDEX IF NOT EXISTS spare_parts_history_created_at_idx ON public.spare_parts_history(created_at DESC);

-- RLS
ALTER TABLE public.spare_parts_history ENABLE ROW LEVEL SECURITY;

-- Policy: Všetci prihlásení používatelia môžu čítať históriu
CREATE POLICY "Authenticated users can view parts history" ON public.spare_parts_history
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policy: Všetci prihlásení používatelia môžu pridávať záznamy
CREATE POLICY "Authenticated users can insert parts history" ON public.spare_parts_history
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Overiť
SELECT * FROM public.spare_parts_history ORDER BY created_at DESC LIMIT 5;
