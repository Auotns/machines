-- SQL skript na opravu rolí používateľov
-- Spusti tento skript v Supabase SQL editore

-- 1. Zobraz všetkých používateľov a ich roly
SELECT 
  u.id,
  u.email,
  pu.role as current_role_in_users_table,
  au.raw_user_meta_data->>'role' as role_in_auth_metadata
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;

-- 2. Aktualizuj roly v public.users aby sa zhodovali s auth.users metadata
-- Toto opraví existujúcich používateľov
UPDATE public.users pu
SET role = COALESCE(au.raw_user_meta_data->>'role', 'technician')
FROM auth.users au
WHERE pu.id = au.id
  AND pu.role != COALESCE(au.raw_user_meta_data->>'role', 'technician');

-- 3. Vylepšený trigger - načíta rolu z user_metadata
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

-- 4. Skontroluj výsledok
SELECT 
  u.id,
  u.email,
  pu.role as current_role_in_users_table,
  au.raw_user_meta_data->>'role' as role_in_auth_metadata
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;

-- 5. Ak chceš manuálne nastaviť rolu konkrétnemu používateľovi:
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE email = 'tvoj.admin@email.com';
