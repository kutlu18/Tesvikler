# Modular Architecture (SOLID-Oriented)

Bu proje, yeni teşvik modüllerini mevcut modülleri bozmadan eklemek için "core + module registry" yaklaşımıyla organize edilmiştir.

## Principles

- `S` Single Responsibility:
  - Her modül kendi `types`, `data`, `logic`, `components`, `page` katmanında ayrıdır.
  - App sadece modül seçimi ve render sorumluluğuna sahiptir.
- `O` Open/Closed:
  - Yeni modül eklemek için mevcut modülleri değiştirmek gerekmez.
  - `src/modules/<modul>/index.ts` + `src/modules/registry.ts` kaydı yeterlidir.
- `L` Liskov Substitution:
  - Tüm modüller ortak `AppModule` kontratını uygular.
- `I` Interface Segregation:
  - App, modüllerden yalnızca ortak interface alanlarını bekler (`key`, `label`, `page`).
- `D` Dependency Inversion:
  - App somut modüllere değil, `module registry` ve `AppModule` soyutlamasına bağımlıdır.

## Current Project Tree

```text
src/
  App.tsx
  main.tsx
  index.css

  core/
    module-system/
      types.ts
      createModuleRegistry.ts

  modules/
    registry.ts
    sgk/
      index.ts
    kosgeb/
      index.ts
    tubitak/
      index.ts
    yatirimTesvik/
      index.ts
    ticaret/
      index.ts

  sgk/
    SgkLegacyInfoPage.tsx

  kosgeb/
    types.ts
    data/
      kosgebSupports.ts
    logic/
      evaluateKosgebSupports.ts
    components/
      KosgebQuestionSection.tsx
      KosgebResultCard.tsx
      KosgebSummaryDashboard.tsx
    KosgebEligibilityPage.tsx

  tubitak/
    types.ts
    data/
      tubitakSupports.ts
    logic/
      evaluateTubitakSupports.ts
    components/
      TubitakQuestionSection.tsx
      TubitakResultCard.tsx
      TubitakSummaryDashboard.tsx
    TubitakEligibilityPage.tsx

  yatirimTesvik/
    types.ts
    data/
      yatirimTesvikSupports.ts
    logic/
      evaluateYatirimTesvik.ts
    components/
      YatirimTesvikQuestionSection.tsx
      YatirimTesvikResultCard.tsx
      YatirimTesvikSummaryDashboard.tsx
    YatirimTesvikEligibilityPage.tsx

  ticaret/
    types.ts
    data/
      ticaretSupports.ts
    logic/
      evaluateTicaretSupports.ts
    components/
      TicaretQuestionSection.tsx
      TicaretResultCard.tsx
      TicaretSummaryDashboard.tsx
    TicaretEligibilityPage.tsx
```

## How to Add a New Module

1. `src/<newModule>/` altında aşağıyı oluştur:
   - `types.ts`
   - `data/*Supports.ts`
   - `logic/evaluate*.ts`
   - `components/*`
   - `<NewModule>EligibilityPage.tsx`
2. `src/modules/<newModule>/index.ts` oluştur ve `AppModule` export et.
3. `src/modules/registry.ts` içine yeni modülü ekle.
4. Bitti: `App.tsx` değişmeden yeni modül görünür.

## Optional Next Step

İstersen bir sonraki adımda tüm modül klasörlerini `src/features/` altına taşıyarak domain bazlı tam "feature-first" yapıya geçebiliriz.
