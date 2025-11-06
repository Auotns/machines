-- SQL skript na vymazanie všetkých používateľov a vytvorenie nových
-- Spusti tento skript v Supabase SQL editore: https://qqkcnogssccsekhemyua.supabase.co/project/_/sql

-- =====================================================
-- KROK 1: Vymazať všetkých používateľov
-- =====================================================

-- Vymaž všetky záznamy z public.users (automaticky sa vymažu kvôli CASCADE)
DELETE FROM public.users;

-- Vymaž všetkých používateľov z auth.users
DELETE FROM auth.users;

-- Overiť, že sú vymazaní
SELECT COUNT(*) as users_count FROM auth.users;
SELECT COUNT(*) as public_users_count FROM public.users;

-- =====================================================
-- KROK 2: Uistite sa, že máte správny trigger
-- =====================================================

-- Vylepšený trigger - načíta rolu z user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Získať rolu z user metadata, ak neexistuje použiť 'technician'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'technician');
  
  -- Vytvoriť profil s správnou rolou
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, user_role)
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uisti sa, že trigger existuje
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- POZNÁMKY PRE VYTVORENIE NOVÝCH POUŽÍVATEĽOV
-- =====================================================

-- Po spustení vyššie uvedených SQL príkazov:

-- 1. Choď do Supabase Dashboard → Authentication → Users
-- 2. Klikni "Add user" → "Create new user"

-- ADMIN POUŽÍVATEĽ:
-- Email: tvoj-admin@email.com
-- Password: tvoje-heslo
-- Confirm password: true
-- User Metadata (JSON):
-- {
--   "role": "admin"
-- }

-- TECHNICIAN POUŽÍVATEĽ:
-- Email: tvoj-technik@email.com
-- Password: tvoje-heslo
-- Confirm password: true
-- User Metadata (JSON):
-- {
--   "role": "technician"
-- }

-- =====================================================
-- OVERENIE
-- =====================================================

-- Po vytvorení používateľov spusti tento query pre overenie:
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'role' as role_in_metadata,
  pu.role as role_in_users_table,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;

-- Výsledok by mal ukazovať oboch používateľov so správnymi rolami v oboch tabuľkách
