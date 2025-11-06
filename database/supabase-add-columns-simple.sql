-- Pridať stĺpce manufacturer a image_url
-- Spustite tento skript v Supabase SQL Editor

ALTER TABLE devices ADD COLUMN IF NOT EXISTS manufacturer TEXT;

ALTER TABLE devices ADD COLUMN IF NOT EXISTS image_url TEXT;
