-- Add specifications column to devices table
-- This column stores device specifications as JSONB (dimensions, weight, connections, etc.)

ALTER TABLE devices 
  ADD COLUMN IF NOT EXISTS specifications JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN devices.specifications IS 'Device specifications stored as JSON (e.g., {"Rozmery": "100x50x30 cm", "Váha": 250, "Príkon": "5 kW"})';

-- Create GIN index for faster JSONB queries (allows searching within specifications)
CREATE INDEX IF NOT EXISTS idx_devices_specifications_gin 
  ON devices USING GIN (specifications);

-- Example queries that can now be used:
-- Find devices with specific specification key:
--   SELECT * FROM devices WHERE specifications ? 'Rozmery';
-- Find devices with specific specification value:
--   SELECT * FROM devices WHERE specifications @> '{"Váha": 250}';
-- Get all specification keys across devices:
--   SELECT DISTINCT jsonb_object_keys(specifications) FROM devices WHERE specifications IS NOT NULL;
