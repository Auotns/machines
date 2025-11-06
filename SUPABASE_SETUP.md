# Supabase Setup Guide - Equipment Maintenance Hub

Tento návod vás prevedie nastavením Supabase backendu pre Equipment Maintenance Hub.

## 📋 Obsah

1. [Vytvorenie Supabase projektu](#1-vytvorenie-supabase-projektu)
2. [Konfigurácia databázy](#2-konfigurácia-databázy)
3. [Nastavenie autentifikácie](#3-nastavenie-autentifikácie)
4. [Konfigurácia aplikácie](#4-konfigurácia-aplikácie)
5. [Vytvorenie testovacích používateľov](#5-vytvorenie-testovacích-používateľov)
6. [Pridanie mock dát](#6-pridanie-mock-dát)
7. [Testovanie](#7-testovanie)
8. [Deployment](#8-deployment)

---

## 1. Vytvorenie Supabase projektu

### Krok 1.1: Registrácia

1. Prejdite na [https://supabase.com](https://supabase.com)
2. Kliknite na "Start your project"
3. Prihláste sa cez GitHub (odporúčané) alebo email

### Krok 1.2: Nový projekt

1. Kliknite na "New Project"
2. Vyplňte údaje:
   - **Name**: equipment-maintenance-hub
   - **Database Password**: Vytvorte silné heslo (uložte si ho!)
   - **Region**: Vyberte najbližší región
   - **Pricing Plan**: Free (pre začiatok)
3. Kliknite "Create new project"
4. Počkajte 2-3 minúty na inicializáciu

### Krok 1.3: Získanie API údajov

1. V ľavom menu kliknite na **Project Settings** (ikona ozubeného kolieska)
2. Vyberte **API**
3. Skopírujte:
   - **Project URL** (napr. `https://xxxxx.supabase.co`)
   - **anon public** key (dlhý reťazec začínajúci s `eyJ...`)

---

## 2. Konfigurácia databázy

### Krok 2.1: SQL Editor

1. V ľavom menu kliknite na **SQL Editor**
2. Kliknite na "New Query"

### Krok 2.2: Spustenie SQL schémy

1. Otvorte súbor `supabase-schema.sql` v tomto projekte
2. Skopírujte **celý obsah** súboru
3. Vložte ho do SQL Editora
4. Kliknite na **RUN** (alebo Ctrl+Enter)
5. Počkajte na úspešné vykonanie (zelená správa)

### Krok 2.3: Overenie tabuliek

1. V ľavom menu kliknite na **Table Editor**
2. Mali by ste vidieť 4 tabuľky:
   - ✅ `users`
   - ✅ `devices`
   - ✅ `spare_parts`
   - ✅ `maintenance_logs`

---

## 3. Nastavenie autentifikácie

### Krok 3.1: Email Auth

1. V ľavom menu kliknite na **Authentication**
2. Vyberte **Providers**
3. Skontrolujte že **Email** je povolený (enabled)

### Krok 3.2: Email Templates (voliteľné)

1. Vyberte **Email Templates**
2. Môžete upraviť šablóny pre:
   - Confirm signup
   - Magic link
   - Password reset

### Krok 3.3: URL Configuration

1. Vyberte **URL Configuration**
2. **Site URL**: `http://localhost:3000` (pre development)
3. **Redirect URLs**: Pridajte:
   ```
   http://localhost:3000
   http://localhost:3000/**
   ```

---

## 4. Konfigurácia aplikácie

### Krok 4.1: Environment súbory

1. Otvorte `src/environments/environment.ts`
2. Nahraďte hodnoty:

```typescript
export const environment = {
  production: false,
  enableMockData: false, // !!! Dôležité: nastavte na false
  enableLogging: true,

  supabase: {
    url: "YOUR_SUPABASE_URL", // Sem vložte Project URL
    anonKey: "YOUR_SUPABASE_ANON_KEY", // Sem vložte anon public key
  },

  // Legacy API konfigurácia (nepoužíva sa)
  apiUrl: "http://localhost:3001/api",
  apiTimeout: 30000,
  jwtTokenKey: "auth_token",
  refreshTokenKey: "refresh_token",
};
```

### Krok 4.2: Production environment

1. Otvorte `src/environments/environment.prod.ts`
2. Nastavte rovnaké hodnoty (pre production použite production URL)

### Krok 4.3: .env.local (voliteľné)

Môžete vytvoriť `.env.local` pre lokálne testovanie:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 5. Vytvorenie testovacích používateľov

### Metóda A: Cez Supabase Dashboard (Jednoduchšie)

1. **Prejdite na Authentication > Users**
2. Kliknite **Add user**
3. **Vytvorte Admin používateľa:**

   - Email: `admin@example.com`
   - Password: `password123` (alebo silnejšie)
   - Auto Confirm User: ✅ (zaškrtnite)
   - Kliknite **Create user**

4. **Vytvorte Technician používateľa:**

   - Email: `technician@example.com`
   - Password: `password123`
   - Auto Confirm User: ✅
   - Kliknite **Create user**

5. **Nastavte roly:**
   - Prejdite na **Table Editor > users**
   - Nájdite používateľa s emailom `admin@example.com`
   - Zmeňte `role` na `admin`
   - Druhého používateľa nechajte ako `technician`

### Metóda B: Registrácia cez aplikáciu

1. Spustite aplikáciu: `npm run dev`
2. Ak implementujete sign-up page, registrujte sa tam
3. Manuálne zmeňte rolu v Table Editor

---

## 6. Pridanie mock dát

### Krok 6.1: Pridanie zariadení

1. Prejdite na **Table Editor > devices**
2. Kliknite **Insert row**
3. Pridajte vzorové zariadenia:

**Zariadenie 1:**

```
id: cnc-001
name: CNC Mill
type: Machining
location: Shop Floor A
status: operational
last_maintenance: 2024-06-15
next_maintenance: 2024-09-15
downtime: 10.5
last_status_change: 2024-07-20T10:00:00Z
```

**Zariadenie 2:**

```
id: lathe-002
name: Industrial Lathe
type: Machining
location: Shop Floor A
status: maintenance
last_maintenance: 2024-07-20
next_maintenance: 2024-07-28
downtime: 25.2
last_status_change: 2024-07-22T08:30:00Z
```

### Krok 6.2: Pridanie náhradných dielov

1. Prejdite na **Table Editor > spare_parts**
2. Pridajte vzorové diely podobným spôsobom

### Krok 6.3: Bulk Import (Rýchlejšie)

1. V **Table Editor** kliknite na tabuľku
2. Kliknite **...** (tri bodky) > **Import data via spreadsheet**
3. Vložte CSV dáta

**Príklad CSV pre devices:**

```csv
id,name,type,location,status,last_maintenance,next_maintenance,downtime,last_status_change
cnc-001,CNC Mill,Machining,Shop Floor A,operational,2024-06-15,2024-09-15,10.5,2024-07-20T10:00:00Z
lathe-002,Industrial Lathe,Machining,Shop Floor A,maintenance,2024-07-20,2024-07-28,25.2,2024-07-22T08:30:00Z
```

---

## 7. Testovanie

### Krok 7.1: Spustenie aplikácie

```bash
npm run dev
```

### Krok 7.2: Test prihlásenia

1. Otvorte `http://localhost:3000`
2. Kliknite "Sign in as Admin"
3. Mali by ste byť presmerovaní na dashboard
4. Skontrolujte konzolu na chyby

### Krok 7.3: Test CRUD operácií

1. **Zariadenia:** Skúste zmeniť stav zariadenia
2. **Maintenance Log:** Pridajte nový záznam
3. **Spare Parts:** Skontrolujte zoznam dielov

### Krok 7.4: Kontrola Network

1. Otvorte DevTools (F12)
2. Prejdite na Network tab
3. Mali by ste vidieť volania na Supabase:
   - `https://xxxxx.supabase.co/rest/v1/devices`
   - `https://xxxxx.supabase.co/auth/v1/token`

---

## 8. Deployment

### Vercel (Odporúčané)

1. **Push na GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/equipment-maintenance-hub.git
git push -u origin main
```

2. **Vercel Deployment:**

   - Prejdite na [vercel.com](https://vercel.com)
   - Kliknite **New Project**
   - Importujte váš GitHub repo
   - **Environment Variables:**
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJ...
     ```
   - Kliknite **Deploy**

3. **Aktualizujte Supabase URL Configuration:**
   - V Supabase prejdite na **Authentication > URL Configuration**
   - Pridajte production URL: `https://your-app.vercel.app`

### Netlify

Podobný proces ako Vercel, použite environment variables.

---

## 🔒 Bezpečnosť

### Row Level Security (RLS)

✅ RLS je už nakonfigurované v SQL schéme

- Používatelia vidia len svoje dáta
- Admini majú rozšírené oprávnenia

### API Keys

⚠️ **NIKDY** nezdieľajte:

- `service_role` key (má plný prístup)
- Database password

✅ **Môžete zdieľať:**

- `anon public` key (je bezpečný pre frontend)

### Best Practices

1. Používajte silné heslá
2. Povoľte 2FA v Supabase
3. Pravidelne zálohujte databázu
4. Monitorujte usage v Supabase dashboarde

---

## 🐛 Troubleshooting

### Chyba: "Invalid API key"

- Skontrolujte či ste správne skopírovali `anonKey`
- Prezrite environment súbory

### Chyba: "Row Level Security policy violation"

- Skontrolujte či ste spustili celú SQL schému
- Overte RLS policies v Table Editor

### Prihlásenie nefunguje

- Skontrolujte či používateľ existuje v Authentication > Users
- Overte že tabuľka `users` obsahuje záznam
- Skontrolujte konzolu na chyby

### Dáta sa nenačítajú

- Skontrolujte Network tab v DevTools
- Overte že `enableMockData: false`
- Skontrolujte RLS policies

---

## 📚 Ďalšie zdroje

- [Supabase Dokumentácia](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage) (pre upload manuálov)

---

## 🎉 Gratulujeme!

Váš Equipment Maintenance Hub je teraz nasadený na Supabase!

**Ďalšie kroky:**

1. Pridajte skutočných používateľov
2. Naplňte databázu reálnymi dátami
3. Customize email templates
4. Implementujte Storage pre upload PDF manuálov
5. Nastavte Real-time subscriptions pre live updates

---

## 💡 Užitočné príkazy

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Aktualizovať dependencies
npm update

# Skontrolovať chyby
npm run lint
```

---

**Potrebujete pomoc?** Otvorte issue na GitHub alebo kontaktujte support.
