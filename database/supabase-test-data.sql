-- Equipment Maintenance Hub - Testovacie data
-- Spustite tento SQL v Supabase SQL Editor

-- 1. Pridať testovacie zariadenia
INSERT INTO devices (name, type, location, status, manual_url, last_maintenance, next_maintenance, downtime, last_status_change)
VALUES
  ('CNC Fréza F200', 'Fréza', 'Hala A - Sekcia 1', 'operational', 'https://example.com/manuals/cnc-f200.pdf', '2024-10-15', '2025-01-15', 0, NOW()),
  ('Sústruh ST-500', 'Sústruh', 'Hala A - Sekcia 2', 'operational', 'https://example.com/manuals/st-500.pdf', '2024-10-20', '2025-01-20', 0, NOW()),
  ('Hydraulický lis HP-100', 'Lis', 'Hala B - Sekcia 1', 'maintenance', 'https://example.com/manuals/hp-100.pdf', '2024-09-10', '2024-11-10', 48, NOW() - INTERVAL '2 days'),
  ('Rezačka Laser L-300', 'Laser', 'Hala B - Sekcia 3', 'operational', 'https://example.com/manuals/laser-l300.pdf', '2024-10-25', '2025-01-25', 0, NOW()),
  ('Zváračka Robot RW-50', 'Robotické zváranie', 'Hala C - Sekcia 1', 'operational', NULL, '2024-10-18', '2025-01-18', 0, NOW()),
  ('Kompresor K-2000', 'Kompresor', 'Technická miestnosť', 'offline', 'https://example.com/manuals/k-2000.pdf', '2024-08-15', '2024-11-15', 120, NOW() - INTERVAL '5 days'),
  ('Brúska BG-150', 'Brúska', 'Hala A - Sekcia 3', 'operational', NULL, '2024-10-22', '2025-01-22', 0, NOW()),
  ('Ohýbačka plechu BP-400', 'Ohýbačka', 'Hala B - Sekcia 2', 'maintenance', 'https://example.com/manuals/bp-400.pdf', '2024-09-28', '2024-11-28', 24, NOW() - INTERVAL '1 day');

-- 2. Pridať náhradné diely
INSERT INTO spare_parts (name, sku, quantity, location)
VALUES
  ('Vreteno 200mm', 'VRT-200-001', 5, 'Sklad A - Regal 12'),
  ('Hydraulický valec 100mm', 'HYD-100-023', 3, 'Sklad B - Regal 5'),
  ('Laserová trubica CO2', 'LSR-CO2-045', 2, 'Sklad A - Regal 8'),
  ('Zváracie drôty 1.2mm', 'ZVR-12-150', 150, 'Sklad C - Sekcia 3'),
  ('Kompresorový olej 5L', 'KMP-OIL-5L', 20, 'Sklad B - Regal 2'),
  ('Brúsne kotúče 150mm', 'BRS-150-080', 45, 'Sklad A - Regal 15'),
  ('Hydraulické tesnenia', 'HYD-TSN-MIX', 30, 'Sklad B - Regal 5'),
  ('Chladiaca kvapalina 10L', 'CHL-10L-001', 12, 'Sklad B - Regal 1'),
  ('Rezné plátky HM', 'REZ-HM-025', 60, 'Sklad A - Regal 10'),
  ('Elektromotor 2.2kW', 'MOT-22KW-005', 2, 'Sklad C - Sekcia 1');

-- 3. Pridať maintenance logy
-- Získať ID zariadení pre maintenance logy
WITH device_ids AS (
  SELECT id, name FROM devices LIMIT 8
)
INSERT INTO maintenance_logs (device_id, device_name, date, technician, notes, type)
SELECT 
  d.id,
  d.name,
  date_col,
  technician_name,
  notes_text,
  log_type
FROM device_ids d
CROSS JOIN (
  VALUES
    -- CNC Fréza F200
    ('2024-10-15'::date, 'Martin Novák', 'Pravidelná údržba - výmena oleja, kontrola vretena', 'scheduled'),
    ('2024-09-10'::date, 'Ján Kováč', 'Havarijná oprava - výmena vretena po poruche', 'emergency'),
    
    -- Sústruh ST-500
    ('2024-10-20'::date, 'Peter Horák', 'Štvrťročná kontrola - kalibrácia, čistenie', 'scheduled'),
    
    -- Hydraulický lis HP-100
    ('2024-11-02'::date, 'Martin Novák', 'Oprava hydraulického systému - výmena tesnení', 'emergency'),
    ('2024-09-10'::date, 'Ján Kováč', 'Pravidelná údržba - kontrola tlaku, výmena filtra', 'scheduled'),
    
    -- Rezačka Laser L-300
    ('2024-10-25'::date, 'Peter Horák', 'Výmena zrkadiel a kontrola optickej dráhy', 'scheduled'),
    
    -- Zváračka Robot RW-50
    ('2024-10-18'::date, 'Martin Novák', 'Kalibrácia robota, výmena zváracích drôtov', 'scheduled'),
    
    -- Kompresor K-2000
    ('2024-10-30'::date, 'Ján Kováč', 'Havarijná porucha - výmena kompresora', 'emergency'),
    ('2024-08-15'::date, 'Peter Horák', 'Pravidelná údržba - výmena oleja a filtra', 'scheduled')
) AS logs(date_col, technician_name, notes_text, log_type)
WHERE d.name IN ('CNC Fréza F200', 'Sústruh ST-500', 'Hydraulický lis HP-100', 'Rezačka Laser L-300', 'Zváračka Robot RW-50', 'Kompresor K-2000')
LIMIT 9;

-- 4. Overiť vložené dáta
SELECT 'Devices:' as table_name, COUNT(*) as count FROM devices
UNION ALL
SELECT 'Spare Parts:', COUNT(*) FROM spare_parts
UNION ALL
SELECT 'Maintenance Logs:', COUNT(*) FROM maintenance_logs
UNION ALL
SELECT 'Users:', COUNT(*) FROM users;
