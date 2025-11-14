-- -- =====================================================
-- OPRAVA RLS POLICIES PRE MAINTENANCE_LOGS
-- =====================================================
-- Problém: Záznamy údržby sa neukladajú alebo nezobrazujú

-- 1. Skontrolovať aktuálne policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'maintenance_logs';

-- 2. Odstrániť staré policies
DROP POLICY IF EXISTS "Authenticated users can view maintenance logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Users can insert maintenance logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Admins can update maintenance logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Admins can delete maintenance logs" ON public.maintenance_logs;

-- 3. Vytvoriť nové, funkčné policies
-- Všetci autentifikovaní používatelia môžu čítať záznamy údržby
CREATE POLICY "Authenticated users can view maintenance logs" ON public.maintenance_logs
  FOR SELECT 
  TO authenticated
  USING (true);

-- Všetci autentifikovaní používatelia môžu pridávať záznamy údržby
CREATE POLICY "Authenticated users can insert maintenance logs" ON public.maintenance_logs
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Všetci autentifikovaní používatelia môžu aktualizovať záznamy údržby
CREATE POLICY "Authenticated users can update maintenance logs" ON public.maintenance_logs
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Len admin môže mazať záznamy údržby
CREATE POLICY "Admins can delete maintenance logs" ON public.maintenance_logs
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Overiť nové policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'maintenance_logs';

-- 5. Skontrolovať existujúce záznamy
SELECT id, device_name, date, technician, type, created_at
FROM public.maintenance_logs
ORDER BY created_at DESC
LIMIT 10;
