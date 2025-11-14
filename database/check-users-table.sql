-- =====================================================
-- KONTROLA USERS TABUĽKY
-- =====================================================

-- 1. Overiť či existuje tabuľka users
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'users';

-- 2. Overiť štruktúru tabuľky users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Overiť obsah tabuľky users
SELECT * FROM public.users;

-- 4. Overiť auth.users
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users;

-- =====================================================
-- AK TABUĽKA USERS NEEXISTUJE, VYTVOR JU:
-- =====================================================

-- Vytvoriť tabuľku users (ak neexistuje)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'technician')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Povoliť RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policy pre čítanie
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- RLS policy pre všetkých authenticated users (jednoduchšie)
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.users;
CREATE POLICY "Authenticated users can view all profiles" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- =====================================================
-- NAPLNIŤ TABUĽKU USERS Z AUTH.USERS
-- =====================================================

-- Vymazať staré záznamy
DELETE FROM public.users;

-- Vytvoriť záznamy z auth.users
INSERT INTO public.users (id, email, role)
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' IS NOT NULL;

-- Overiť výsledok
SELECT * FROM public.users;
