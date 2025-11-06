<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Equipment Maintenance Hub 🔧

Komplexná Angular aplikácia pre profesionálnu správu údržby priemyselných zariadení s Supabase backendom.

## ✨ Hlavné funkcie

### 🔐 Autentifikácia a prístupové práva

- Supabase Auth s JWT tokenmi
- Rolové oprávnenia (Admin / Technician)
- Bezpečnostné politiky (Row Level Security)

### �️ Správa zariadení

- **CRUD operácie** - Vytváranie, čítanie, aktualizácia, mazanie zariadení
- **Vlastné ID** - Generovanie QR kódov pre identifikáciu
- **Stavy zariadení** - V prevádzke / V údržbe / Mimo prevádzky
- **Výrobca a fotky** - Ukladanie obrázkov zariadení do Supabase Storage
- **PDF manuály** - Pripojenie technickej dokumentácie
- **Špecifikácie** - Dynamické polia pre rozmery, váhu, príkon, pripojenia atď.
- **Údržbové periódy** - Automatický výpočet dátumu ďalšej údržby (mesačne/štvrťročne/polročne/ročne)
- **Elektrická revízia** - Sledovanie platnosti revízií s upozorneniami

### 📦 Správa náhradných dielov

- **Inventár** - Evidencia skladových zásob
- **Priradenie k zariadeniam** - Prepojenie dielov s konkrétnymi zariadeniami
- **Audit trail** - Kompletná história zmien množstva s povinnými poznámkami
- **Typy zmien** - Navýšenie / Zníženie / Nastavenie množstva

### 📊 Dashboard a štatistiky

- **Prehľad zariadení** - Operačné / V údržbe / Offline
- **Nízke zásoby** - Upozornenia na diely pod minimálnym množstvom
- **Mesačný downtime** - Dynamický výpočet prestojov (160h/zariadenie/mesiac)
- **Target 2.5%** - Sledovanie cieľového prestoju
- **Nedávna aktivita** - História posledných údržbových zásahov

### 📝 Záznamy údržby

- **Typy údržby** - Plánovaná / Neodkladná (emergency)
- **Dĺžka trvania** - Minimálne 15 minút, ukladané v minútach
- **Poznámky** - Detailný popis vykonanej práce
- **Automatická zmena stavu** - Pri začatí údržby prepnutie do "V údržbe"

### ⏱️ Downtime tracking

- **Per-device štatistiky** - Individuálne sledovanie prestojov
- **Historické dáta** - Výber mesiaca (posledných 12 mesiacov)
- **Percentuálne metriky** - Porovnanie s 2.5% cieľom
- **Aktívne zariadenia** - Automatické filtrovanie offline zariadení
- **Počet údržieb** - Sledovanie frekvencie zásahov

### 📤 Export dát

- **CSV export** - Kompletný zoznam zariadení
- **UTF-8 BOM** - Správne zobrazenie v Exceli
- **Formátované špecifikácie** - Čitateľný výstup kľúč-hodnota párov
- **Timestamp názvy** - Automatické dátumové označenie súborov

### 🌍 Viacjazyčnosť

- **3 jazyky** - Slovenčina (SK), Angličtina (EN), Nemčina (DE)
- **Dynamické prepínanie** - Okamžitá zmena bez reloadu
- **Kompletná lokalizácia** - Všetky UI elementy preložené

### 🎨 Používateľské rozhranie

- **Modern UI** - Tailwind CSS dizajn systém
- **Responsive** - Optimalizované pre desktop, tablet, mobil
- **QR kódy** - Google Charts API integrácia
- **Status indikátory** - Farebné označenie stavov (zelená/žltá/červená)
- **Loading states** - Vizuálna spätná väzba pri operáciách

## 🚀 Quick Start

### Predpoklady

- Node.js 18+
- Supabase účet ([registrácia](https://supabase.com))

### Inštalácia

1. **Klonujte projekt:**

```bash
git clone <repo-url>
cd equipment-maintenance-hub
```

2. **Nainštalujte závislosti:**

```bash
npm install
```

3. **Nastavte Supabase:**

   - Postupujte podľa [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Vytvorte Supabase projekt
   - Spustite SQL schému
   - Skopírujte API credentials

4. **Nakonfigurujte environment:**

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  enableMockData: false, // false = Supabase, true = Mock dáta
  supabase: {
    url: "YOUR_SUPABASE_URL",
    anonKey: "YOUR_SUPABASE_ANON_KEY",
  },
};
```

5. **Spustite aplikáciu:**

```bash
npm run dev
```

6. **Otvorte prehliadač:**

```
http://localhost:3000
```

## 🎮 Demo používatelia

Po nastavení Supabase vytvorte týchto používateľov:

- **Admin:** `admin@example.com` / `password123`
- **Technician:** `technician@example.com` / `password123`

## 📁 Štruktúra projektu

```
equipment-maintenance-hub/
├── src/
│   ├── components/          # Angular komponenty
│   │   ├── dashboard/
│   │   ├── devices/
│   │   ├── maintenance/
│   │   ├── parts/
│   │   └── shared/
│   ├── core/               # Core služby
│   │   ├── interceptors/   # HTTP interceptory
│   │   └── services/       # API, Supabase, Notifications
│   ├── environments/       # Environment konfigurácia
│   ├── models.ts          # TypeScript modely
│   ├── pipes/             # Custom pipes
│   └── services/          # Business logika
├── supabase-schema.sql    # SQL schéma databázy
├── SUPABASE_SETUP.md      # Návod na setup
└── README.md
```

## 🛠️ Technológie

- **Frontend:** Angular 20.3+ (Standalone Components, Signals)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Database:** PostgreSQL s JSONB podporou
- **Styling:** Tailwind CSS 3.x
- **Language:** TypeScript 5.x
- **Build:** Vite
- **HTTP:** Direct fetch() API (obídenie Supabase JS client issue)
- **Icons:** Heroicons
- **Charts:** Google Charts API (QR kódy)

## 🏗️ Architektúra

### Database Schema

```sql
-- Devices table
devices (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  manufacturer TEXT,
  location TEXT,
  status TEXT,
  image_url TEXT,
  manual_url TEXT,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_period VARCHAR(20),
  specifications JSONB,
  electrical_inspection_date DATE,
  electrical_inspection_period INTEGER,
  electrical_inspection_expiry DATE,
  downtime NUMERIC,
  last_status_change TIMESTAMP
)

-- Spare Parts table
spare_parts (
  id UUID PRIMARY KEY,
  name TEXT,
  sku TEXT,
  quantity INTEGER,
  location TEXT,
  device_id TEXT,
  device_name TEXT
)

-- Maintenance Logs table
maintenance_logs (
  id UUID PRIMARY KEY,
  device_id TEXT,
  device_name TEXT,
  date DATE,
  technician TEXT,
  notes TEXT,
  type TEXT,
  duration_minutes INTEGER CHECK (duration_minutes >= 15)
)

-- Spare Parts History table
spare_parts_history (
  id UUID PRIMARY KEY,
  part_id UUID,
  part_name TEXT,
  quantity_before INTEGER,
  quantity_after INTEGER,
  change_type TEXT,
  notes TEXT,
  changed_by TEXT,
  created_at TIMESTAMP
)
```

### Key Features Implementation

#### 1. Direct Fetch Pattern

```typescript
// Obídenie problému s @supabase/supabase-js klientom
fetch(`${supabaseUrl}/rest/v1/devices`, {
  headers: {
    apikey: supabaseKey,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

#### 2. Angular Signals

```typescript
// Reaktívny state management
devices = signal<Device[]>([]);
filteredDevices = computed(() => /* ... */);
```

#### 3. JSONB Specifications

```typescript
// Dynamické špecifikácie
specifications: Record<string, string | number> = {
  Rozmery: "100x50x30 cm",
  Váha: 250,
  Príkon: "5 kW",
};
```

## 📚 Dokumentácia

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Kompletný návod na nastavenie Supabase
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Pôvodná backend integrácia
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - API príklady

## 🔧 Vývoj

### Mock dáta (bez Supabase)

```typescript
// environment.ts
enableMockData: true; // Použije lokálne mock dáta
```

### Production build

```bash
npm run build
```

### Preview production

```bash
npm run preview
```

## 🌐 Deployment

### Vercel

1. Push na GitHub
2. Import projektu na Vercel
3. Pridať environment variables
4. Deploy

### Netlify

Podobne ako Vercel

**Detailné deployment inštrukcie:** [SUPABASE_SETUP.md#deployment](./SUPABASE_SETUP.md#8-deployment)

## 🔒 Bezpečnosť

- ✅ Row Level Security (RLS) v Supabase
- ✅ JWT autentifikácia
- ✅ Bezpečné API keys
- ✅ HTTPS only v production

## 🤝 Prispievanie

1. Fork projektu
2. Vytvorte feature branch
3. Commit zmeny
4. Push do branchu
5. Otvorte Pull Request

## 📝 Licencia

MIT License

## 👨‍💻 Autor

Vytvorené pomocou AI Studio

---

**Potrebujete pomoc?** Prečítajte si [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) alebo otvorte issue.
