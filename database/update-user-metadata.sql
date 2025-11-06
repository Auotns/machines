-- Kompletný skript na nastavenie User Metadata pre admin a technician
-- Spusti v Supabase SQL Editore

-- =====================================================
-- KROK 1: Nastav User Metadata v auth.users
-- =====================================================

-- Nastav admina (zmeň email podľa potreby)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';  -- ZMEŇ EMAIL

-- Nastav technika (zmeň email podľa potreby)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"technician"'
)
WHERE email = 'technician@example.com';  -- ZMEŇ EMAIL

-- =====================================================
-- KROK 2: Synchronizuj do public.users tabuľky
-- =====================================================

-- Aktualizuj všetky roly v public.users podľa auth metadata
UPDATE public.users pu
SET role = COALESCE(au.raw_user_meta_data->>'role', 'technician')
FROM auth.users au
WHERE pu.id = au.id;

-- =====================================================
-- KROK 3: Overiť výsledok
-- =====================================================

SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'role' as metadata_role,
  pu.role as users_table_role,
  CASE 
    WHEN au.raw_user_meta_data->>'role' = pu.role THEN '✓ OK'
    ELSE '✗ NESÚHLASÍ'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.email;

-- Očakávaný výsledok:
-- Všetci používatelia by mali mať status "✓ OK"
-- metadata_role a users_table_role by mali byť rovnaké
