# Backend Integration Guide

## Prehľad zmien

Tento dokument popisuje implementáciu backend integrácie a vylepšení pre Equipment Maintenance Hub.

## 📁 Nová štruktúra projektu

```
src/
├── core/
│   ├── interceptors/
│   │   ├── auth.interceptor.ts       # JWT autentifikácia
│   │   └── error.interceptor.ts      # Error handling
│   └── services/
│       ├── api.service.ts             # HTTP komunikácia
│       └── notification.service.ts    # Notifikácie
├── environments/
│   ├── environment.ts                 # Development config
│   └── environment.prod.ts            # Production config
├── components/
│   └── shared/
│       └── notifications/
│           └── notifications.component.ts  # UI notifikácie
└── services/
    ├── auth.service.ts                # JWT autentifikácia
    └── data.service.ts                # API volania
```

## 🔧 Implementované funkcie

### 1. Environment konfigurácia

**Súbory:**

- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

**Konfigurácia:**

```typescript
{
  production: false,
  apiUrl: 'http://localhost:3001/api',
  apiTimeout: 30000,
  enableMockData: true,  // Pre vývoj používať mock dáta
  enableLogging: true,
  jwtTokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
}
```

### 2. HTTP Interceptory

#### Auth Interceptor

- Automaticky pridáva JWT token do Authorization hlavičky
- Pridáva base URL k relatívnym endpointom
- Presmeruje na login pri 401 chybe

#### Error Interceptor

- Timeout handling (30s predvolene)
- Centralizované error spracovanie
- Používateľsky prívetivé chybové hlášky

### 3. API Service

Centralizovaný service pre HTTP volania s helper metódami:

```typescript
// Základné metódy
api.get<T>(endpoint, params?)
api.post<T>(endpoint, body)
api.put<T>(endpoint, body)
api.patch<T>(endpoint, body)
api.delete<T>(endpoint)

// Helper metódy
api.getById<T>(endpoint, id)
api.create<T>(endpoint, data)
api.update<T>(endpoint, id, data)
api.remove<T>(endpoint, id)
```

### 4. Auth Service s JWT

**Funkcie:**

- ✅ JWT token autentifikácia
- ✅ Refresh token mechanizmus
- ✅ Automatické obnovenie tokenu
- ✅ Token expiration check
- ✅ Fallback na mock login pre development

**API Endpoints:**

```
POST /api/auth/login       - Prihlásenie
POST /api/auth/logout      - Odhlásenie
POST /api/auth/refresh     - Obnovenie tokenu
```

### 5. Data Service

Prepracovaný na podporu backend API s fallback mechanizmom:

**Metódy:**

```typescript
// Devices
loadDevices(): Observable<Device[]>
getDeviceById(id): Observable<Device>
updateDeviceStatus(id, status): Observable<Device>

// Parts
getParts(): Observable<SparePart[]>

// Maintenance
getMaintenanceLogs(): Observable<MaintenanceLog[]>
addMaintenanceLog(log): Observable<MaintenanceLog>
```

**Funkcie:**

- Automatický fallback na mock dáta pri chybe
- Synchronizácia lokálneho stavu so serverom
- Error handling s notifikáciami

### 6. Notification Service

Systém notifikácií s UI komponentom:

**Typy notifikácií:**

- Success (zelená)
- Error (červená)
- Warning (žltá)
- Info (modrá)

**Použitie:**

```typescript
notificationService.success("Úspešne uložené");
notificationService.error("Chyba pri ukladaní");
notificationService.warning("Upozornenie");
notificationService.info("Informácia");
```

## 🚀 Režimy behu

### Development Mode (Mock Data)

```typescript
// environment.ts
enableMockData: true;
```

- Používa lokálne mock dáta
- Simuluje API volania s delay
- Mock JWT tokeny
- Bez potreby backendu

### Production Mode (Real API)

```typescript
// environment.prod.ts
enableMockData: false;
apiUrl: "https://api.yourproduction.com/api";
```

- Skutočné API volania
- JWT autentifikácia
- Error handling
- Automatický fallback pri chybe

## 📡 Backend API Endpoints

Aplikácia očakáva nasledujúce REST API endpointy:

### Authentication

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

### Devices

```
GET    /api/devices
GET    /api/devices/:id
POST   /api/devices
PUT    /api/devices/:id
PATCH  /api/devices/:id/status
DELETE /api/devices/:id
```

### Parts

```
GET    /api/parts
GET    /api/parts/:id
POST   /api/parts
PUT    /api/parts/:id
DELETE /api/parts/:id
```

### Maintenance Logs

```
GET    /api/maintenance-logs
POST   /api/maintenance-logs
GET    /api/maintenance-logs/:id
```

## 🔐 JWT Token štruktúra

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1730764800,
  "exp": 1730851200
}
```

## 🛠️ Nastavenie backendu

Pre lokálny vývoj odporúčame:

1. **Node.js + Express backend**
2. **Port:** 3001
3. **Database:** MongoDB / PostgreSQL
4. **CORS:** Povoliť pre localhost:3000

### Ukážkový Express server

```javascript
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.post("/api/auth/login", (req, res) => {
  // Implementovať prihlásenie
});

// Device routes
app.get("/api/devices", (req, res) => {
  // Vrátiť zoznam zariadení
});

app.listen(3001, () => {
  console.log("API server running on port 3001");
});
```

## 🧪 Testovanie

### Mock mode (bez backendu)

```bash
npm run dev
```

### S lokálnym backendom

1. Spustiť backend server na porte 3001
2. Zmeniť `enableMockData: false` v `environment.ts`
3. Spustiť `npm run dev`

## 📝 Ďalšie kroky

1. Implementovať backend API server
2. Pridať unit testy pre services
3. Implementovať E2E testy
4. Nastaviť CI/CD pipeline
5. Pridať monitoring a logging
6. Implementovať rate limiting
7. Pridať request/response cache

## 🐛 Debugging

### Logovanie HTTP requestov

V development mode sú automaticky logované všetky HTTP requesty a errory do konzoly.

### Vypnutie mock dát

```typescript
// environment.ts
enableMockData: false;
```

### Nastavenie API timeout

```typescript
// environment.ts
apiTimeout: 60000; // 60 sekúnd
```

## 🔒 Bezpečnosť

- ✅ JWT tokeny v localStorage
- ✅ Automatické refresh tokeny
- ✅ Token expiration check
- ✅ Automatické odhlásenie pri 401
- ⚠️ Pre produkciu odporúčame HTTP-only cookies
- ⚠️ Implementovať CSRF protection
- ⚠️ Rate limiting na API

## 📚 Ďalšie zdroje

- [Angular HTTP Client](https://angular.io/guide/http)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [REST API Design](https://restfulapi.net/)
