-- =====================================================
-- OPRAVA RLS POLICIES PRE USERS TABUĽKU
-- =====================================================
-- Problém: Druhá policy vytvára circular dependency
-- Riešenie: Zjednodušiť policies, odstrániť problematické EXISTS

-- 1. Povoliť RLS (ak je vypnuté)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Odstrániť staré problematické policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- 3. Vytvoriť jednoduché, funkčné policies
-- Každý používateľ môže vidieť svoj vlastný profil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Každý používateľ môže aktualizovať svoj vlastný profil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id);

-- Poznámka: Ak potrebujete, aby admin videl všetkých používateľov,
-- musíte použiť iný prístup (napr. service_role alebo separátny endpoint)

-- =====================================================
-- OVERENIE
-- =====================================================
-- Skontrolujte aktívne policies:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';
