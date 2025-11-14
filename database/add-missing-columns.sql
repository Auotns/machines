-- =====================================================
-- PRIDANIE CHÝBAJÚCICH STĹPCOV DO DEVICES TABUĽKY
-- =====================================================
-- Oprava chyby: Could not find 'electrical_inspection_date' column

-- Pridať stĺpce pre elektrickú revíziu
ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS electrical_inspection_date DATE,
ADD COLUMN IF NOT EXISTS electrical_inspection_expiry DATE,
ADD COLUMN IF NOT EXISTS electrical_inspection_interval INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS electrical_inspection_period INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS maintenance_period TEXT,
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Vytvoriť indexy pre nové stĺpce
CREATE INDEX IF NOT EXISTS devices_electrical_inspection_date_idx 
ON public.devices(electrical_inspection_date);

CREATE INDEX IF NOT EXISTS devices_electrical_inspection_expiry_idx 
ON public.devices(electrical_inspection_expiry);

CREATE INDEX IF NOT EXISTS devices_manufacturer_idx 
ON public.devices(manufacturer);

-- Overiť schému tabuľky
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'devices'
ORDER BY ordinal_position;
