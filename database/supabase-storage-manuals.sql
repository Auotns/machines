-- Vytvoriť Storage bucket pre PDF manuály zariadení

-- 1. Vytvoriť bucket (ak neexistuje)
INSERT INTO storage.buckets (id, name, public)
VALUES ('device-manuals', 'device-manuals', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Nastaviť politiky pre bucket
-- Povoliť čítanie pre všetkých prihlásených používateľov
CREATE POLICY "Authenticated users can view manuals"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'device-manuals');

-- Povoliť upload len pre administrátorov
CREATE POLICY "Admins can upload manuals"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'device-manuals' 
  AND (auth.jwt() ->> 'role')::text = 'admin'
);

-- Povoliť aktualizáciu len pre administrátorov
CREATE POLICY "Admins can update manuals"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'device-manuals')
WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

-- Povoliť vymazanie len pre administrátorov
CREATE POLICY "Admins can delete manuals"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'device-manuals' 
  AND (auth.jwt() ->> 'role')::text = 'admin'
);

-- Overiť vytvorenie bucketu
SELECT * FROM storage.buckets WHERE id = 'device-manuals';
