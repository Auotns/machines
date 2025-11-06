# Deployment na GitHub

## ✅ Projekt pripravený na nasadenie!

### Dokončené prípravy:

1. ✅ **README.md** - Kompletná dokumentácia s funkciami a návodom
2. ✅ **.gitignore** - Vylúčené node_modules, dist, environment.ts
3. ✅ **package.json** - Doplnené metadata (description, keywords, repository)
4. ✅ **environment.example.ts** - Príklad konfigurácie pre nových vývojárov
5. ✅ **database/** - Všetky SQL skripty organizované so sprievodnou dokumentáciou

---

## 📤 Kroky na upload na GitHub

### 1. Inicializujte Git repozitár

```bash
cd C:\Users\cmelk\Downloads\equipment-maintenance-hub
git init
```

### 2. Pridajte .gitignore (už vytvorený)

Uistite sa, že `src/environments/environment.ts` NIE JE commitnutý:

```bash
# Skontrolujte či je ignorovaný
git status
```

### 3. Prvý commit

```bash
git add .
git commit -m "Initial commit: Equipment Maintenance Hub v1.0

✨ Funkcie:
- Správa zariadení (CRUD, QR kódy, špecifikácie)
- Náhradné diely s audit trailom
- Downtime tracking (2.5% target)
- Elektrická revízia s upozorneniami
- Údržbové periódy s automatickým výpočtom
- Export do CSV
- Viacjazyčnosť (SK/EN/DE)
- Supabase backend (PostgreSQL + Auth + Storage)"
```

### 4. Vytvorte repozitár na GitHube

1. Prejdite na https://github.com/new
2. Názov: `equipment-maintenance-hub`
3. Description: "Komplexná Angular aplikácia pre profesionálnu správu údržby priemyselných zariadení"
4. **Public** alebo **Private** podľa potreby
5. **NEPRIDÁVAJTE** README, .gitignore, LICENSE (už máte lokálne)
6. Kliknite "Create repository"

### 5. Pripojte a push-nite

```bash
git remote add origin https://github.com/VASE_MENO/equipment-maintenance-hub.git
git branch -M main
git push -u origin main
```

---

## 🔒 Bezpečnostné upozornenie

**NIKDY necommitujte:**

- ❌ `src/environments/environment.ts` (obsahuje Supabase credentials)
- ❌ `node_modules/`
- ❌ `.env` súbory

**.gitignore** je nastavený tak, aby toto automaticky ignoroval!

---

## 📋 Po upload-e na GitHub

### Aktualizujte README odkazy:

V `package.json` zmeňte:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/VASE_MENO/equipment-maintenance-hub.git"
},
"bugs": {
  "url": "https://github.com/VASE_MENO/equipment-maintenance-hub/issues"
},
"homepage": "https://github.com/VASE_MENO/equipment-maintenance-hub#readme"
```

---

## 🚀 Deploy na Vercel/Netlify

### Vercel (odporúčané):

1. Prejdite na https://vercel.com
2. "Import Git Repository"
3. Vyberte váš GitHub repozitár
4. Nastavte environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Deploy!

### Netlify:

1. Prejdite na https://netlify.com
2. "Add new site" → "Import from Git"
3. Vyberte GitHub repozitár
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Pridajte environment variables
7. Deploy!

---

## 📝 GitHub Features odporúčané:

### 1. GitHub Pages (pre dokumentáciu)

- Zapnite v Settings → Pages
- Použite `/docs` alebo `gh-pages` branch

### 2. GitHub Actions (CI/CD)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
```

### 3. Issue Templates

Vytvorte `.github/ISSUE_TEMPLATE/bug_report.md` a `feature_request.md`

### 4. GitHub Discussions

Zapnite v Settings → Features → Discussions

---

## 🏷️ Vytvorte Release

Po prvom úspešnom deploy-e:

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Production ready"
git push origin v1.0.0
```

Potom na GitHub vytvorte Release:

1. Releases → "Create a new release"
2. Tag: `v1.0.0`
3. Title: "v1.0.0 - Production Release"
4. Popis: Skopírujte hlavné funkcie z README.md

---

## 📊 Badges pre README

Pridajte na začiatok README.md:

```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Angular](https://img.shields.io/badge/angular-20.3-red.svg)
![Supabase](https://img.shields.io/badge/supabase-PostgreSQL-green.svg)
```

---

## ✨ Projekt je pripravený!

Všetko je nastavené pre úspešný upload na GitHub. Postupujte podľa krokov vyššie a váš projekt bude verejne dostupný alebo súkromne uložený podľa vášho výberu.

**Good luck! 🚀**
