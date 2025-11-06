# Nastavenie Storage pre PDF manuály

## Kroky na nastavenie v Supabase

### 1. Vytvorenie Storage Bucketu

Prejdite do Supabase Dashboard:

1. Otvorte projekt: https://qqkcnogssccsekhemyua.supabase.co
2. V ľavom menu kliknite na **Storage**
3. Kliknite na **Create a new bucket**
4. Zadajte:
   - **Name**: `device-manuals`
   - **Public bucket**: ✅ (zaškrtnite)
5. Kliknite **Create bucket**

### 2. Nastavenie politík (alternatívne cez SQL)

Ak preferujete SQL, prejdite do **SQL Editor** a spustite obsah súboru:

```
supabase-storage-manuals.sql
```

### 3. Dočasné vypnutie RLS (len pre testovanie)

Ak politiky nefungujú, môžete dočasne vypnúť RLS pre storage:

```sql
-- Dočasne povoliť všetko (len pre development!)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**UPOZORNENIE**: Toto je len pre development. V produkcii by mali byť politiky správne nastavené.

## Testovanie

1. Prihláste sa ako **admin@example.com**
2. Prejdite do **Zariadenia** → kliknite na detail zariadenia
3. V pravom paneli v sekcii **Actions** uvidíte:
   - Input pre nahrávanie PDF súboru (len pre adminov)
   - Tlačidlo **📄 VIEW MANUAL (PDF)** (ak je manuál nahraný)

## Technické detaily

- **Bucket name**: `device-manuals`
- **Public URL pattern**: `https://qqkcnogssccsekhemyua.supabase.co/storage/v1/object/public/device-manuals/manuals/{filename}`
- **Max file size**: 10MB
- **Accepted format**: PDF only
- **Permissions**:
  - Upload: Admin only
  - View: All authenticated users

## Riešenie problémov

### Chyba: "Bucket does not exist"

- Overte či existuje bucket `device-manuals` v Storage
- Bucket musí byť označený ako **public**

### Chyba: "Permission denied"

- Skontrolujte či sú politiky správne nastavené
- Dočasne vypnite RLS: `ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;`

### Manuál sa nenahrá

- Skontrolujte console v prehliadači (F12)
- Overte maximálnu veľkosť súboru (10MB)
- Overte formát súboru (musí byť PDF)
