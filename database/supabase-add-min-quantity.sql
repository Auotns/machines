-- Pridanie stĺpca min_quantity do tabuľky spare_parts
-- Tento stĺpec definuje minimálne požadované množstvo pre každý diel

ALTER TABLE public.spare_parts 
ADD COLUMN IF NOT EXISTS min_quantity INTEGER NOT NULL DEFAULT 10;

-- Vytvor index pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS spare_parts_min_quantity_idx ON public.spare_parts(min_quantity);

-- Aktualizuj existujúce diely s rozumným defaultom (10 kusov)
UPDATE public.spare_parts 
SET min_quantity = 10 
WHERE min_quantity IS NULL;

-- Overiť výsledok
SELECT id, name, sku, quantity, min_quantity, location
FROM public.spare_parts
ORDER BY name;
