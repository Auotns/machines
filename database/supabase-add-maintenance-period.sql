-- Add maintenance_period column to devices table
-- This column stores the frequency of scheduled maintenance (monthly, quarterly, semi-annually, annually)

ALTER TABLE devices 
  ADD COLUMN IF NOT EXISTS maintenance_period VARCHAR(20);

-- Add constraint to ensure only valid period values (drop if exists first)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'maintenance_period_check'
  ) THEN
    ALTER TABLE devices 
      ADD CONSTRAINT maintenance_period_check 
      CHECK (maintenance_period IN ('monthly', 'quarterly', 'semi-annually', 'annually'));
  END IF;
END $$;

-- Add comment to explain the column
COMMENT ON COLUMN devices.maintenance_period IS 'Frequency of scheduled maintenance: monthly, quarterly, semi-annually, or annually';

-- Create index for faster queries filtering by maintenance period
CREATE INDEX IF NOT EXISTS idx_devices_maintenance_period 
  ON devices(maintenance_period);
