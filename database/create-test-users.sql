-- =====================================================
-- VYTVORENIE TESTOVACÍCH POUŽÍVATEĽOV
-- =====================================================
-- Spusti tento skript v Supabase SQL Editor
-- https://saxuyqdrrxaqdmbiaaws.supabase.co/project/_/sql

-- NAJPRV: Overiť existujúcich používateľov
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users;

-- =====================================================
-- VYMAZAŤ STARÝCH POUŽÍVATEĽOV (ak existujú)
-- =====================================================
-- Pozor: Toto vymaže všetkých existujúcich používateľov!
DELETE FROM auth.users;

-- =====================================================
-- VYTVORIŤ NOVÝCH POUŽÍVATEĽOV
-- =====================================================

-- 1. ADMIN používateľ
-- Email: admin@example.com
-- Heslo: admin123
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"role": "admin"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- 2. TECHNICIAN používateľ
-- Email: technician@example.com
-- Heslo: tech123
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'technician@example.com',
  crypt('tech123', gen_salt('bf')),
  now(),
  '{"role": "technician"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- =====================================================
-- OVERIŤ VYTVORENÝCH POUŽÍVATEĽOV
-- =====================================================
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'role' as role,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- =====================================================
-- PRIHLASOVACIE ÚDAJE NA TESTOVANIE:
-- =====================================================
-- 
-- ADMIN:
-- Email: admin@example.com
-- Heslo: admin123
-- 
-- TECHNICIAN:
-- Email: technician@example.com
-- Heslo: tech123
-- 
-- =====================================================
