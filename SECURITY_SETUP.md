# 🔒 Bezpečnostné nastavenie projektu

## ⚠️ URGENTNÉ - Prvé kroky po clone

### 1. Nastavenie Environment súborov

**NIKDY necommitujte skutočné credentials do Git!**

```bash
# Súbory environment.ts a environment.prod.ts sú v .gitignore
# Skopírujte example súbory a vyplňte vlastné hodnoty
```

#### Development Environment (`src/environments/environment.ts`)

1. Skopírujte `environment.example.ts` do `environment.ts`
2. Vyplňte svoje Supabase credentials:
   - Prihláste sa do [Supabase Dashboard](https://supabase.com/dashboard)
   - Prejdite do: Project Settings > API
   - Skopírujte **Project URL** a **anon/public key**
   - Vložte do `environment.ts`

```typescript
export const environment = {
  production: false,
  enableMockData: false,
  enableLogging: true,
  
  supabase: {
    url: 'https://YOUR_PROJECT_ID.supabase.co', // ← Sem vložte svoju URL
    anonKey: 'eyJhbGc...', // ← Sem vložte svoj anon key
  },
  
  // ...zvyšok konfigurácie
};
```

#### Production Environment (`src/environments/environment.prod.ts`)

Pre production deployment používajte **environment variables** namiesto hard-coded hodnôt:

**GitHub Pages / GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
env:
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

**Netlify / Vercel:**
- Pridajte environment variables v dashboard
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 2. Supabase Security Checklist

#### ✅ Row Level Security (RLS)

**KRITICKÉ**: Zabezpečte, že všetky tabuľky majú RLS enabled:

```sql
-- Skontrolujte RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Ak nie je enabled, zapnite ho:
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

#### ✅ RLS Policies - Príklad

```sql
-- Users môžu čítať len svoje vlastné dáta
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Admini môžu upravovať zariadenia
CREATE POLICY "Admins can update devices" ON devices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Všetci prihlásení môžu čítať zariadenia
CREATE POLICY "Authenticated users can read devices" ON devices
  FOR SELECT
  TO authenticated
  USING (true);
```

#### ✅ Storage Bucket Security

```sql
-- Pre device-manuals bucket
CREATE POLICY "Authenticated users can upload manuals"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'device-manuals');

CREATE POLICY "Public can view manuals"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'device-manuals');
```

### 3. Content Security Policy (CSP)

CSP je už pridané v `index.html`. Ak pridávate nové CDN zdroje, aktualizujte CSP:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://trusted-cdn.com; 
               ...">
```

### 4. Rotácia Supabase Keys (Ak boli kompromitované)

Ak boli credentials omylom commitnuté do Git:

1. **Ihneď rotujte API keys** v Supabase Dashboard:
   - Project Settings > API > Roll anon key
   
2. **Odstráňte z Git histórie**:
```bash
# Použite git-filter-repo alebo BFG Repo-Cleaner
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/environments/environment.ts" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ nebezpečné - koordinujte s tímom)
git push origin --force --all
```

3. **Aktualizujte všetky deployment secrets**

### 5. Bezpečnostné Best Practices

#### Tokens v localStorage
- ✅ Používame `localStorage` (nie ideálne, ale lepšie ako nič)
- 🔄 TODO: Migrovať na `httpOnly` cookies (vyžaduje backend)
- ✅ Token expirácia kontrola implementovaná

#### Input Sanitization
- ✅ Angular má built-in XSS ochranu
- 🔄 TODO: Backend validácia v Supabase (triggers/functions)

#### HTTPS Only
- ✅ GitHub Pages automaticky používa HTTPS
- ✅ Supabase používa HTTPS

#### Rate Limiting
- 🔄 TODO: Implementovať Supabase Edge Functions s rate limiting

### 6. Monitoring & Incident Response

#### Nastavenie Error Monitoring (Odporúčané)

**Sentry.io (Free tier):**
```typescript
// src/app.config.ts
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: environment.sentryDsn,
  environment: environment.production ? 'production' : 'development',
  beforeSend(event) {
    // Sanitizovať citlivé dáta
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  }
});
```

#### Security Incident Checklist

Ak zistíte bezpečnostný incident:

1. ☐ Okamžite rotujte všetky API keys a credentials
2. ☐ Skontrolujte Supabase logs na neautorizovaný prístup
3. ☐ Vykonajte audit databázy (kto čo modifikoval)
4. ☐ Informujte používateľov ak boli kompromitované osobné údaje
5. ☐ Aktualizujte RLS policies
6. ☐ Dokumentujte incident a preventívne opatrenia

### 7. Regular Security Audits

**Mesačne:**
- ☐ Skontrolovať Supabase logs na podozrivú aktivitu
- ☐ Aktualizovať npm dependencies (`npm audit fix`)
- ☐ Reviewovať RLS policies

**Kvartálne:**
- ☐ Rotovať API keys (best practice)
- ☐ Security audit codebase
- ☐ Penetration testing (ak možné)

---

## 📚 Ďalšie Zdroje

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security Guide](https://angular.dev/best-practices/security)

---

**Posledná aktualizácia:** 14. November 2025  
**Verzia:** 1.0.0
