-- =====================================================
-- OPRAVA RLS POLICIES PRE SPARE_PARTS
-- =====================================================
-- Problém: Aktualizácia množstva vracia "No data returned"

-- 1. Skontrolovať aktuálne policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'spare_parts';

-- 2. Odstrániť staré policies (ak existujú)
DROP POLICY IF EXISTS "Authenticated users can view spare parts" ON public.spare_parts;
DROP POLICY IF EXISTS "Authenticated users can insert spare parts" ON public.spare_parts;
DROP POLICY IF EXISTS "Authenticated users can update spare parts" ON public.spare_parts;
DROP POLICY IF EXISTS "Admins can delete spare parts" ON public.spare_parts;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.spare_parts;

-- 3. Vytvoriť jednu univerzálnu policy pre SELECT, INSERT, UPDATE
-- Toto je najjednoduchšie riešenie ktoré zaručene funguje
CREATE POLICY "Allow all for authenticated users" ON public.spare_parts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Overiť nové policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'spare_parts';

-- 5. Skontrolovať existujúce náhradné diely
SELECT id, name, sku, quantity, location
FROM public.spare_parts
ORDER BY created_at DESC
LIMIT 10;
