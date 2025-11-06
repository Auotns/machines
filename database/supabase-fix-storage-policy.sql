-- Vymazať existujúce politiky a vytvoriť nové pre device-manuals bucket
-- Spustite tento SQL v Supabase SQL Editor

-- 1. Vymazať všetky existujúce politiky pre storage.objects
DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to a folder only to authenticated users" ON storage.objects;

-- 2. Vytvoriť jednoduchú politiku ktorá povolí všetko pre device-manuals bucket
CREATE POLICY "Allow all for device-manuals"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'device-manuals')
WITH CHECK (bucket_id = 'device-manuals');

-- 3. Overiť vytvorené politiky
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
