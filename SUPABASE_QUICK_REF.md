# Supabase Quick Reference 🚀

## 🔑 Kde nájsť API credentials

1. [supabase.com](https://supabase.com) → Login
2. Váš projekt → **Settings** → **API**
3. Skopírujte:
   - `Project URL`
   - `anon public` key

## ⚡ Rýchle začatie

```typescript
// 1. Nastavte environment
// src/environments/environment.ts
export const environment = {
  enableMockData: false,
  supabase: {
    url: 'https://xxxxx.supabase.co',
    anonKey: 'eyJ...',
  },
};

// 2. Spustite SQL schému
// Supabase Dashboard → SQL Editor → Run supabase-schema.sql

// 3. Vytvorte používateľov
// Authentication → Users → Add user
// admin@example.com / password123 (role: admin)
// technician@example.com / password123 (role: technician)

// 4. Spustite aplikáciu
npm run dev
```

## 📊 Database Tables

| Tabuľka            | Popis                                         |
| ------------------ | --------------------------------------------- |
| `users`            | Používateľské profily (id, email, role)       |
| `devices`          | Zariadenia (id, name, type, location, status) |
| `spare_parts`      | Náhradné diely (id, name, sku, quantity)      |
| `maintenance_logs` | Záznamy údržby (id, device_id, date, notes)   |

## 🔐 Row Level Security (RLS)

**Už nakonfigurované!** ✅

- Používatelia vidia len svoje dáta
- Admini majú plný prístup
- Definované v `supabase-schema.sql`

## 🎯 Použitie v kóde

### Autentifikácia

```typescript
// Login
this.authService.login("admin", "password123").subscribe();

// Logout
this.authService.logout().subscribe();

// Check auth
const isAuth = await this.authService.isAuthenticated();
```

### Dáta

```typescript
// Načítať zariadenia
this.dataService.loadDevices().subscribe((devices) => {
  console.log(devices);
});

// Zmena stavu
this.dataService.updateDeviceStatus("device-id", "maintenance").subscribe();

// Pridať log
this.dataService
  .addMaintenanceLog({
    deviceId: "device-id",
    deviceName: "CNC Mill",
    date: "2024-11-04",
    technician: "admin@example.com",
    notes: "Regular maintenance",
    type: "scheduled",
  })
  .subscribe();
```

## 🐛 Časté problémy

### "Invalid API key"

```typescript
// Skontrolujte environment.ts
console.log(environment.supabase);
```

### "Row Level Security policy violation"

```sql
-- Skontrolujte RLS policies v Supabase Dashboard
-- Table Editor → Tabuľka → Policies
```

### Dáta sa nenačítavajú

```typescript
// 1. Skontrolujte enableMockData
enableMockData: false; // Musí byť false!

// 2. Skontrolujte Network tab
// DevTools → Network → hľadajte supabase.co requesty

// 3. Konzola
// Hľadajte error messages
```

## 📦 Pridanie mock dát

### Cez SQL Editor

```sql
INSERT INTO devices (id, name, type, location, status, next_maintenance, downtime, last_status_change)
VALUES
('cnc-001', 'CNC Mill', 'Machining', 'Shop Floor A', 'operational', '2024-12-01', 0, NOW());
```

### Cez Table Editor

1. Table Editor → devices
2. Insert row → Vyplňte polia
3. Save

## 🔄 Real-time Updates (voliteľné)

```typescript
// Sledovať zmeny v devices
const subscription = this.supabaseService.subscribeToTable(
  "devices",
  (payload) => {
    console.log("Device changed:", payload);
    // Aktualizovať UI
  }
);

// Zrušiť subscription
this.supabaseService.unsubscribe(subscription);
```

## 📤 Upload súborov (manuály PDF)

```typescript
// Vytvoriť storage bucket v Supabase
// Storage → Create bucket → 'manuals'

// Upload
const file = event.target.files[0];
const { data, error } = await this.supabaseService.storage
  .from("manuals")
  .upload(`device-${deviceId}.pdf`, file);

// Get public URL
const { data: urlData } = this.supabaseService.storage
  .from("manuals")
  .getPublicUrl(`device-${deviceId}.pdf`);
```

## 🚀 Deployment checklist

- [ ] Supabase projekt vytvorený
- [ ] SQL schéma spustená
- [ ] Používatelia vytvorení
- [ ] Environment variables nastavené
- [ ] `enableMockData: false`
- [ ] Production URL pridaná do Supabase Auth
- [ ] Aplikácia nasadená (Vercel/Netlify)
- [ ] Test prihlásenia
- [ ] Test CRUD operácií

## 🔗 Užitočné linky

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)
- [SQL Editor](https://supabase.com/dashboard/project/_/sql)
- [Table Editor](https://supabase.com/dashboard/project/_/editor)
- [Authentication](https://supabase.com/dashboard/project/_/auth/users)

## 💡 Tips & Tricks

1. **Backup:** Pravidelne zálohovať databázu cez Settings → Database → Backups
2. **Logs:** Monitorovať v Logs Explorer na chyby
3. **Usage:** Sledovať usage v Reports → avoid free tier limits
4. **RLS:** Vždy testovať permissions s rôznymi rolami
5. **Indexes:** Pre veľké dáta pridať indexy na často používané stĺpce

---

**Viac info:** Pozrite [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
