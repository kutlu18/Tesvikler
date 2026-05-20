# Tesvik Analiz Platformu

React/Vite tabanli devlet destekleri ve tesvik on uygunluk analiz platformu.

## Kurulum

```powershell
npm ci
npm run local
```

Local adres:

```text
http://127.0.0.1:5173/
```

## Ortam Degiskenleri

`.env.example` dosyasini temel alarak `.env` olusturun.

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Supabase publishable key frontend tarafinda kullanilabilir; service role veya secret key kesinlikle frontend'e konulmamalidir.

## Build

```powershell
npm run build
```

## Supabase

DB migration dosyalari:

```text
supabase/migrations/
```

Mevcut tablolar:

- `profiles`
- `analyses`
- `analysis_notes`
- `activity_logs`
- `analysis_documents`

RLS politikalarinda kullanici sadece kendi verisine erisir.

## Test ve UAT

Is analisti hesaplama test kosucusu:

```powershell
node .\node_modules\esbuild\bin\esbuild .\tests\uat-business-rules.ts --bundle --platform=node --format=esm --outfile=.\tests\uat-business-rules.mjs
node .\tests\uat-business-rules.mjs
```

UAT dokumanlari:

- `docs/UAT_IS_ANALISTI_HESAPLAMA_TEST_SENARYOLARI.md`
- `docs/UAT_TEST_RUN_2026-05-20.md`
- `docs/TESTER_URUN_ANALIZI.md`

## Revizyon Akisi

Detayli akis:

```text
docs/REVISION_WORKFLOW.md
```

Ozet:

- `main`: stabil dal
- `feature/*`: yeni ozellik
- `fix/*`: hata duzeltme
- `db/*`: Supabase migration
- `docs/*`: dokumantasyon

