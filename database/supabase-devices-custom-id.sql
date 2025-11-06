-- Upraviť devices tabuľku - zmeniť ID na TEXT pre custom identifikátory
-- UPOZORNENIE: Toto vymaže všetky existujúce zariadenia!
-- Pred spustením si zálohujte dáta ak je to potrebné.

-- 1. Vymazať existujúce zariadenia (kvôli zmene typu ID)
DELETE FROM devices;

-- 2. Upraviť stĺpec ID z UUID na TEXT
ALTER TABLE devices 
  ALTER COLUMN id TYPE TEXT;

-- 3. Odstrániť automatické generovanie UUID
ALTER TABLE devices 
  ALTER COLUMN id DROP DEFAULT;

-- 4. ID pole zostáva PRIMARY KEY, ale už nebude auto-generované
-- Používatelia zadajú vlastné ID (napr. CNC-001, LASER-05)

-- 5. Overiť zmenu
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'devices' AND column_name = 'id';
