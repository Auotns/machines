-- =====================================================
-- SUPABASE RATE LIMITING SETUP
-- =====================================================
-- Ochrana proti DoS útokom a zneužitiu API
-- Implementácia pomocou PostgreSQL funkcií a Supabase Edge Functions

-- POZNÁMKA: Supabase zatiaľ nemá natívny rate limiting v database policies.
-- Toto je dokumentácia pre budúce nastavenie cez Supabase Dashboard.

-- =====================================================
-- RIEŠENIE 1: Supabase Dashboard Rate Limiting
-- =====================================================
-- 1. Prejdite na: https://supabase.com/dashboard/project/saxuyqdrrxaqdmbiaaws/settings/api
-- 2. V sekcii "Rate Limiting" nastavte:
-- - Anonymous requests: 100 requests per hour
-- - Authenticated requests: 1000 requests per hour
--
-- Toto sa konfiguruje v Supabase Dashboard UI, nie cez SQL.

-- =====================================================
-- RIEŠENIE 2: PostgREST Rate Limiting Headers
-- =====================================================
-- PostgREST (Supabase REST API) podporuje rate limiting cez konfiguráciu.
-- Musí sa nastaviť v Supabase projekt settings, nie v databáze.

-- Odporúčané nastavenia pre produkciu:
-- - db-anon-role: 100 req/hour (pre neprihlásených)
-- - db-authenticated-role: 1000 req/hour (pre prihlásených)

-- =====================================================
-- RIEŠENIE 3: Cloudflare Rate Limiting (ODPORÚČANÉ)
-- =====================================================
-- Ak chcete plnú kontrolu nad rate limitingom:
--
-- 1. Nastavte vlastnú doménu (napr. machines.yourdomain.com)
-- 2. Použite Cloudflare DNS
-- 3. Aktivujte Cloudflare Rate Limiting pravidlá:
-- - /rest/_ - 100 req/min per IP
-- - /auth/_ - 10 req/min per IP (ochrana proti brute force)

-- =====================================================
-- RIEŠENIE 4: Application-Level Rate Limiting
-- =====================================================
-- Pre GitHub Pages hosting môžete implementovať rate limiting
-- priamo v Angular aplikácii pomocou RxJS throttle operátorov.
-- Toto je už čiastočne implementované v auth.interceptor.ts

-- Príklad na implementáciu v budúcnosti:
-- CREATE TABLE IF NOT EXISTS public.rate_limit_log (
-- id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
-- user_id UUID REFERENCES auth.users(id),
-- endpoint TEXT NOT NULL,
-- request_count INTEGER DEFAULT 1,
-- window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
-- created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- =====================================================
-- AKTUÁLNE ODPORÚČANIE
-- =====================================================
-- Pre GitHub Pages deployment (bez vlastnej domény):
-- 1. ✅ Supabase RLS policies už sú aktívne (ochrana dát)
-- 2. ✅ JWT tokeny s expirációu (ochrana proti session hijacking)
-- 3. ⚠️ Rate limiting - zatiaľ len základný cez Supabase defaults
--
-- Pre produkčné nasadenie s vlastnou doménou:
-- - Použite Cloudflare alebo iný CDN s rate limiting
-- - Nastavte WAF rules pre dodatočnú ochranu
-- - Monitorujte logy v Supabase Dashboard → Logs

-- =====================================================
-- MONITORING - Sledovanie API usage
-- =====================================================
-- V Supabase Dashboard môžete sledovať:
-- 1. Project Settings → API → API Keys usage
-- 2. Database → Logs → API requests
-- 3. Authentication → Logs → Auth attempts

-- Ak zistíte abnormálny traffic:
-- - Dočasne zablokujte IP cez Supabase Dashboard
-- - Rotujte anon key (vyžaduje rebuild aplikácie)
-- - Kontaktujte Supabase support pre DoS attack mitigation

-- =====================================================
-- ZÁVER
-- =====================================================
-- Supabase poskytuje základnú ochranu out-of-the-box:
-- ✅ JWT tokeny s expirációu
-- ✅ RLS policies
-- ✅ Connection pooling
-- ✅ Základný rate limiting na API gateway úrovni
--
-- Pre GitHub Pages je toto dostatočné pre menšie aplikácie.
-- Pre kritické produkčné nasadenie odporúčame vlastnú doménu + Cloudflare.
