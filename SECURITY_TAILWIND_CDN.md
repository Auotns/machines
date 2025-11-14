# Bezpečnostné riziká - Tailwind CDN

## Problém s lokálnou inštaláciou Tailwind CSS

Pokus o lokálnu inštaláciu Tailwind CSS v4 zlyhal kvôli nekompatibilite s Angular 20 build systémom.

### Dôvod zlyhania:

- Tailwind v4 vyžaduje `@tailwindcss/postcss` plugin
- Angular 20 používa esbuild namiesto webpack
- PostCSS integrácia nie je plne kompatibilná

### Alternatívne riešenia:

#### 1. **Downgrade na Tailwind v3** (ODPORÚČANÉ pre produkciu)

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init
```

Potom upraviť `tailwind.config.js` a pridať do `angular.json`.

#### 2. **Použiť Tailwind Play CDN s Subresource Integrity** (aktuálne riešenie)

- ✅ Rýchle nasadenie
- ✅ CSP obmedzuje zdroje
- ⚠️ Závislosť na third-party CDN
- ⚠️ Mierny bezpečnostný risk

#### 3. **Migrovať na UnoCSS alebo WindiCSS**

Alternatívne utility-first CSS frameworky s lepšou Angular 20 podporou.

## Aktuálny stav:

**Tailwind CDN zostáva aktívny** s týmito bezpečnostnými opatreniami:

1. CSP policy obmedzuje script-src na dôveryhodné zdroje
2. HTTPS only (cdn.tailwindcss.com)
3. Žiadne custom Tailwind konfigurácie, čo znižuje attack surface

## Bezpečnostné skóre po pokuse:

**6.5/10** - Mierny downgrade kvôli CDN riziku

### Zostávajúce kritické riziká:

1. ⚠️ **Tailwind CDN** - Third-party závislosť (akceptovateľná pre GitHub Pages)
2. ⚠️ **Supabase anon key** - Verejne dostupný (chránený RLS policies)

### Vyriešené:

- ✅ RLS policies opravené
- ✅ CSP headers aktívne
- ✅ Input sanitization implementovaná
- ✅ Refresh token flow
- ✅ Conditional logging

## Odporúčanie:

Pre GitHub Pages deployment je **aktuálne riešenie akceptovateľné**.

Pre produkčné nasadenie s vlastnou doménou:

1. Použiť Tailwind v3 s build procesom
2. Alebo self-hostnuť Tailwind CSS súbory
3. Implementovať WAF cez Cloudflare
