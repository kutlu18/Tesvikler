# MongoDB Code-First Template

## Collections
- `companies`
- `opportunities`
- `supportPrograms` (gelecek adim)
- `analysisRuns` (gelecek adim)
- `crmEvents` (gelecek adim)

## One-to-Many
- Company (1) -> Opportunities (N)
- Company (1) -> AnalysisRuns (N)

## Many-to-Many (join collection ile)
- Company (N) <-> SupportProgram (N)
- Join: `opportunities`
  - `companyId`
  - `supportProgramId` (gelecekte eklenecek)
  - `status`
  - `score`
  - `notes`

## Design Notes
- Her entity'de `createdAt`/`updatedAt` zorunlu.
- Soft delete gerekiyorsa `deletedAt` alaný eklenir.
- Sorgu performansi icin compound index:
  - `{ companyId: 1, moduleCode: 1, supportCode: 1 } unique`

## Code-First Workflow
1. Schema tanimla (`packages/db-core/src/mongodb/schemas`).
2. Indexleri schema icinde olustur.
3. `db-core` export et.
4. Service katmani modeli repository gibi kullansin.
5. Migration gerektiginde idempotent script yaz.
