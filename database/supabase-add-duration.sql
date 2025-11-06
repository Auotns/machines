-- Pridať stĺpec duration_minutes do maintenance_logs tabuľky

ALTER TABLE maintenance_logs 
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;

-- Pridať constraint pre minimálnu hodnotu 15 minút
ALTER TABLE maintenance_logs 
  ADD CONSTRAINT duration_min_15 CHECK (duration_minutes >= 15);

-- Overiť zmenu
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'maintenance_logs'
ORDER BY ordinal_position;
