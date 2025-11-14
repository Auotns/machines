-- Skontrolovať RLS politiky pre spare_parts
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'spare_parts';

-- Skontrolovať, či je RLS zapnuté
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'spare_parts';
