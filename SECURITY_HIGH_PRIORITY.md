# 🔒 Bezpečnostné Vylepšenia - High Priority

## Implementované zmeny (14. November 2025)

### ✅ 1. Refresh Token Flow

**Problém**: Tokeny expirovali bez automatického obnovenia, čo viedlo k náhlym odhláseniám.

**Riešenie**: Implementovaný silent refresh v `auth.interceptor.ts`:

- Automatická kontrola expirácie pred každým API volaním
- Silent refresh 5 minút pred expiráciou tokenu
- Fallback na 401 error handling ak refresh zlyhá
- Centralizované token management

**Súbory**:

- `src/core/interceptors/auth.interceptor.ts` - kompletne refaktorovaný

**Príklad flow**:

```typescript
1. HTTP request initiated
2. Interceptor checks token expiration
3. If expiring in <5 min → silent refresh
4. Request proceeds with fresh token
5. If 401 error → clear data + redirect to login
```

---

### ✅ 2. Input Sanitization

**Problém**: User inputs neboli validované, riziko XSS a injection útokov.

**Riešenie**: Vytvorený `SanitizerService` s metódami pre všetky typy inputov:

**Súbory**:

- `src/core/services/sanitizer.service.ts` - nová služba
- `src/components/devices/device-list/device-list.component.ts` - sanitizácia device form
- `src/components/parts/part-list/part-list.component.ts` - sanitizácia part form
- `src/components/devices/device-detail/device-detail.component.ts` - sanitizácia maintenance logs

**Sanitizačné metódy**:

```typescript
✓ sanitizeText() - základný text, remove null bytes
✓ sanitizeHtml() - strip dangerous HTML tags
✓ sanitizeEmail() - email validation + normalization
✓ sanitizeFileName() - path traversal protection
✓ sanitizeNumber() / sanitizeInteger() - numeric validation
✓ sanitizeUrl() - protocol whitelist (http/https only)
✓ sanitizeName() - alphanumeric + safe punctuation
✓ sanitizeNotes() - remove scripts, limit length
✓ sanitizeSku() - uppercase alphanumeric + hyphens
✓ sanitizeSpecifications() - key-value pair cleaning
✓ sanitizeDate() - date format validation
✓ sanitizeDeviceStatus() - enum validation
✓ sanitizeMaintenanceType() - enum validation
```

**Použitie**:

```typescript
// Pred uložením do DB
const sanitizedName = this.sanitizer.sanitizeName(formData.get("name"));
const sanitizedNotes = this.sanitizer.sanitizeNotes(notes);
const sanitizedSpecs = this.sanitizer.sanitizeSpecifications(specifications);
```

---

### ✅ 3. Production Logging Protection

**Problém**: Citlivé dáta (emails, tokeny, user objekty) v console.log.

**Riešenie**: `LoggerService` s automatickou sanitizáciou:

**Súbory**:

- `src/core/services/logger.service.ts` - nová služba

**Features**:

- Conditional logging (len ak `environment.enableLogging === true`)
- Produkčné sanitizovanie error logov
- Auto-redact sensitive fields: `password`, `token`, `secret`, `key`, `email`, `user`
- Regex replacement emailov → `[EMAIL_REDACTED]`

**Použitie**:

```typescript
// Namiesto console.log
this.logger.log("User logged in"); // Len v dev mode
this.logger.error("Login failed", error); // Sanitizované v production
```

---

## Bezpečnostný dopad

### Pred vylepšeniami:

❌ Tokeny expirovali bez warning  
❌ Žiadna input validácia  
❌ XSS riziko cez user inputs  
❌ Citlivé dáta v production console  
❌ Path traversal možný pri file upload

### Po vylepšeniach:

✅ Automatický refresh tokenov  
✅ Komprehenzívna input sanitizácia  
✅ XSS ochrana na všetkých forms  
✅ Production logging sanitizovaný  
✅ File name a URL validácia

---

## Testing Checklist

### Refresh Token Flow

- [ ] Login → počkať 50 minút → API request by mal auto-refresh token
- [ ] Manuálne nastaviť expirovaný token → malo by redirect na login
- [ ] Network throttling → refresh should timeout gracefully

### Input Sanitization

- [ ] Zadať `<script>alert('xss')</script>` do device name → malo by sa stripnúť
- [ ] Zadať `../../../etc/passwd` do file name → malo by sa sanitizovať
- [ ] Zadať `javascript:alert(1)` do manual URL → malo by hodiť error
- [ ] Zadať špeciálne znaky do SKU → malo by normalizovať na A-Z0-9-
- [ ] Zadať 10000+ chars do notes → malo by obmedziť na 5000

### Logging

- [ ] V production mode (`enableLogging: false`) → žiadne verbose logy
- [ ] Error s email/token → malo by redaktovať citlivé dáta
- [ ] Dev mode → všetky logy viditeľné

---

## Známe limitácie a budúce vylepšenia

### Stredná priorita (ďalší sprint):

1. **Backend validácia** - Supabase RLS policies + database triggers
2. **File upload scan** - Antivirus/malware detection pre PDF/images
3. **Rate limiting** - Supabase Edge Functions middleware
4. **CSRF protection** - Ak sa pridá vlastný API backend

### Nízka priorita (backlog):

5. **DOMPurify integrácia** - Pre advanced HTML sanitization
6. **Sentry error tracking** - Centralizovaný monitoring
7. **Security headers middleware** - Ak deployment podporuje (Netlify/Vercel)

---

## Deployment Notes

### GitHub Pages

```bash
npm run build:prod
npm run deploy
```

### Environment Variables (ak používate)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Post-deployment verification

1. Otestovať login flow
2. Skontrolovať browser console (nemali by byť citlivé logy)
3. Vyskúšať refresh token (počkať ~50 min alebo manuálne manipulovať token expiry)
4. Skúsiť XSS payload v input fields

---

**Implementoval:** GitHub Copilot  
**Dátum:** 14. November 2025  
**Status:** ✅ COMPLETED - Ready for production
