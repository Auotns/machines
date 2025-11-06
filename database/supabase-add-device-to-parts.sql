-- Pridať device_id a device_name do spare_parts tabuľky

ALTER TABLE spare_parts 
ADD COLUMN device_id TEXT REFERENCES devices(id) ON DELETE SET NULL,
ADD COLUMN device_name TEXT;

-- Update existujúcich záznamov (necháme NULL pre všeobecné diely)
-- Nič netreba updatovať, môžu byť NULL

-- Overiť zmeny
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'spare_parts';
