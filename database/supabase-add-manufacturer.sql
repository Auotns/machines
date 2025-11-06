-- Pridať stĺpce manufacturer a image_url do devices tabuľky

ALTER TABLE devices 
  ADD COLUMN IF NOT EXISTS manufacturer TEXT;

ALTER TABLE devices 
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Overiť zmenu
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'devices'
ORDER BY ordinal_position;
