-- Pridať stĺpce pre elektrickú revíziu do devices tabuľky

-- 1. Pridať stĺpec pre dátum revízie
ALTER TABLE devices 
  ADD COLUMN IF NOT EXISTS electrical_inspection_date DATE;

-- 2. Pridať stĺpec pre periódu platnosti (v rokoch: 1, 2, 3, 4, 5, 10)
ALTER TABLE devices 
  ADD COLUMN IF NOT EXISTS electrical_inspection_period INTEGER;

-- 3. Pridať constraint pre povolené hodnoty periódy
ALTER TABLE devices 
  ADD CONSTRAINT electrical_inspection_period_check 
  CHECK (electrical_inspection_period IN (1, 2, 3, 4, 5, 10));

-- 4. Pridať stĺpec pre automaticky vypočítanú expiráciu
ALTER TABLE devices 
  ADD COLUMN IF NOT EXISTS electrical_inspection_expiry DATE;

-- 5. Vytvoriť index pre rýchlejšie vyhľadávanie expirovaných revízií
CREATE INDEX IF NOT EXISTS idx_devices_inspection_expiry 
  ON devices(electrical_inspection_expiry);

-- 6. Overiť zmeny
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'devices' 
  AND column_name LIKE 'electrical_%'
ORDER BY ordinal_position;

-- Poznámka:
-- - electrical_inspection_date: Dátum vykonania revízie
-- - electrical_inspection_period: Perioda platnosti v rokoch (1, 2, 3, 4, 5, alebo 10)
-- - electrical_inspection_expiry: Automaticky vypočítaný dátum expirácie (inspection_date + period)
