-- =====================================================
-- EQUIPMENT MAINTENANCE HUB - KOMPLETNÉ NASTAVENIE
-- =====================================================
-- Tento skript vytvorí všetky tabuľky, indexy, RLS policies a triggery
-- Spustite v Supabase SQL Editor: https://supabase.com/dashboard/project/saxuyqdrrxaqdmbiaaws/sql/new
-- =====================================================

-- Povoliť UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'technician')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

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

CREATE INDEX IF NOT EXISTS devices_status_idx ON public.devices(status);
CREATE INDEX IF NOT EXISTS devices_type_idx ON public.devices(type);
CREATE INDEX IF NOT EXISTS devices_location_idx ON public.devices(location);
CREATE INDEX IF NOT EXISTS devices_next_maintenance_idx ON public.devices(next_maintenance);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view devices" ON public.devices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert devices" ON public.devices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update devices" ON public.devices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

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

CREATE INDEX IF NOT EXISTS spare_parts_sku_idx ON public.spare_parts(sku);
CREATE INDEX IF NOT EXISTS spare_parts_quantity_idx ON public.spare_parts(quantity);
CREATE INDEX IF NOT EXISTS spare_parts_location_idx ON public.spare_parts(location);

ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view spare parts" ON public.spare_parts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert spare parts" ON public.spare_parts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update spare parts" ON public.spare_parts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

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

CREATE INDEX IF NOT EXISTS maintenance_logs_device_id_idx ON public.maintenance_logs(device_id);
CREATE INDEX IF NOT EXISTS maintenance_logs_date_idx ON public.maintenance_logs(date);
CREATE INDEX IF NOT EXISTS maintenance_logs_type_idx ON public.maintenance_logs(type);
CREATE INDEX IF NOT EXISTS maintenance_logs_technician_idx ON public.maintenance_logs(technician);

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view maintenance logs" ON public.maintenance_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert maintenance logs" ON public.maintenance_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update maintenance logs" ON public.maintenance_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

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
  VALUES (NEW.id, NEW.email, 'technician');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- HOTOVO!
-- =====================================================
-- Databáza je pripravená na použitie.
-- 
-- ĎALŠIE KROKY:
-- 1. Vytvorte prvého používateľa:
--    - Prejdite na: Authentication → Users → Add user
--    - Email: auotns@gmail.com
--    - Password: (vaše heslo)
--    - Auto Confirm User: ✅
--
-- 2. Nastavte admin rolu (po vytvorení používateľa):
--    UPDATE public.users SET role = 'admin' WHERE email = 'auotns@gmail.com';
--
-- 3. Prihláste sa do aplikácie:
--    https://auotns.github.io/machines/
-- =====================================================

-- Overiť vytvorené tabuľky
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
