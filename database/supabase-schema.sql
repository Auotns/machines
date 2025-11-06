-- Equipment Maintenance Hub - Supabase SQL Schema

-- Povoliť UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Táto tabuľka rozširuje Supabase Auth users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'technician')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);

-- RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Každý používateľ môže čítať svoj profil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admini môžu čítať všetky profily
CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Každý používateľ môže aktualizovať svoj profil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- DEVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.devices (
  id TEXT PRIMARY KEY DEFAULT ('device-' || uuid_generate_v4()),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('operational', 'maintenance', 'offline')),
  manual_url TEXT,
  last_maintenance DATE,
  next_maintenance DATE NOT NULL,
  downtime NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  last_status_change TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexy
CREATE INDEX IF NOT EXISTS devices_status_idx ON public.devices(status);
CREATE INDEX IF NOT EXISTS devices_type_idx ON public.devices(type);
CREATE INDEX IF NOT EXISTS devices_location_idx ON public.devices(location);
CREATE INDEX IF NOT EXISTS devices_next_maintenance_idx ON public.devices(next_maintenance);

-- RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Policy: Všetci prihlásení používatelia môžu čítať zariadenia
CREATE POLICY "Authenticated users can view devices" ON public.devices
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Admini a technici môžu pridávať zariadenia
CREATE POLICY "Users can insert devices" ON public.devices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

-- Policy: Admini a technici môžu aktualizovať zariadenia
CREATE POLICY "Users can update devices" ON public.devices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

-- Policy: Iba admini môžu mazať zariadenia
CREATE POLICY "Admins can delete devices" ON public.devices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- SPARE PARTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.spare_parts (
  id TEXT PRIMARY KEY DEFAULT ('part-' || uuid_generate_v4()),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexy
CREATE INDEX IF NOT EXISTS spare_parts_sku_idx ON public.spare_parts(sku);
CREATE INDEX IF NOT EXISTS spare_parts_quantity_idx ON public.spare_parts(quantity);
CREATE INDEX IF NOT EXISTS spare_parts_location_idx ON public.spare_parts(location);

-- RLS
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

-- Policy: Všetci prihlásení používatelia môžu čítať diely
CREATE POLICY "Authenticated users can view spare parts" ON public.spare_parts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Všetci používatelia môžu pridávať diely
CREATE POLICY "Users can insert spare parts" ON public.spare_parts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

-- Policy: Všetci používatelia môžu aktualizovať diely
CREATE POLICY "Users can update spare parts" ON public.spare_parts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

-- Policy: Iba admini môžu mazať diely
CREATE POLICY "Admins can delete spare parts" ON public.spare_parts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- MAINTENANCE LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id TEXT PRIMARY KEY DEFAULT ('log-' || uuid_generate_v4()),
  device_id TEXT NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  date DATE NOT NULL,
  technician TEXT NOT NULL,
  notes TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('scheduled', 'emergency')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexy
CREATE INDEX IF NOT EXISTS maintenance_logs_device_id_idx ON public.maintenance_logs(device_id);
CREATE INDEX IF NOT EXISTS maintenance_logs_date_idx ON public.maintenance_logs(date);
CREATE INDEX IF NOT EXISTS maintenance_logs_type_idx ON public.maintenance_logs(type);
CREATE INDEX IF NOT EXISTS maintenance_logs_technician_idx ON public.maintenance_logs(technician);

-- RLS
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Všetci prihlásení používatelia môžu čítať logy
CREATE POLICY "Authenticated users can view maintenance logs" ON public.maintenance_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Všetci používatelia môžu pridávať logy
CREATE POLICY "Users can insert maintenance logs" ON public.maintenance_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

-- Policy: Admini môžu aktualizovať logy
CREATE POLICY "Admins can update maintenance logs" ON public.maintenance_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admini môžu mazať logy
CREATE POLICY "Admins can delete maintenance logs" ON public.maintenance_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TRIGGERS - Automatická aktualizácia updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pridať trigger pre každú tabuľku
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_spare_parts_updated_at
  BEFORE UPDATE ON public.spare_parts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_maintenance_logs_updated_at
  BEFORE UPDATE ON public.maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- TRIGGER - Automatické vytvorenie user profilu
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'technician'); -- Predvolená rola
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger po vytvorení nového auth usera
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- MOCK DATA (Voliteľné)
-- =====================================================
-- Môžete pridať vzorové dáta pre testovanie
-- Najprv vytvorte testovacích používateľov cez Supabase Auth Dashboard
-- Potom použite ich UUID v nasledujúcich INSERT príkazoch

-- INSERT INTO public.devices (id, name, type, location, status, last_maintenance, next_maintenance, downtime, last_status_change) VALUES
-- ('cnc-001', 'CNC Mill', 'Machining', 'Shop Floor A', 'operational', '2024-06-15', '2024-09-15', 10.5, '2024-07-20T10:00:00Z'),
-- ('lathe-002', 'Industrial Lathe', 'Machining', 'Shop Floor A', 'maintenance', '2024-07-20', '2024-07-28', 25.2, '2024-07-22T08:30:00Z'),
-- ('press-003', 'Hydraulic Press', 'Fabrication', 'Shop Floor B', 'operational', '2024-05-10', '2024-11-10', 5.0, '2024-06-01T14:00:00Z'),
-- ('robot-004', 'Welding Robot Arm', 'Automation', 'Assembly Line 1', 'offline', '2024-01-05', '2025-01-05', 120.7, '2024-07-15T16:45:00Z');

-- INSERT INTO public.spare_parts (id, name, sku, quantity, location) VALUES
-- ('sp-001', 'Spindle Bearing', 'BRG-5021', 15, 'Bin A-12'),
-- ('sp-002', 'Motor Coolant Pump', 'PMP-C-34', 4, 'Bin B-05'),
-- ('sp-003', 'Hydraulic Fluid Filter', 'FIL-H-99', 45, 'Bin A-15'),
-- ('sp-004', 'Servo Motor', 'MOT-S-850', 8, 'Bin C-01');
