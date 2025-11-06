-- Vytvoriť tabuľku pre históriu zmien náhradných dielov

CREATE TABLE IF NOT EXISTS spare_parts_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id TEXT NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('increase', 'decrease', 'set')),
  notes TEXT,
  changed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_spare_parts_history_part_id ON spare_parts_history(part_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_history_created_at ON spare_parts_history(created_at DESC);

-- Overiť vytvorenie tabuľky
SELECT * FROM spare_parts_history LIMIT 1;
