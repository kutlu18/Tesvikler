# Architecture Principles (SOLID)

## Boundaries
- `apps/*`: Entry points (UI/API). Orkestrasyon yapar, is kurali barindirmaz.
- `services/*`: Uygulama servisleri ve use-case orchestration.
- `packages/*`: Reusable kutuphaneler (types, config, db).
- `infra/*`: Cevresel calisma bileþenleri (docker, db init).

## SOLID Eslestirmesi
1. SRP: Her paket tek sorumlulukta.
2. OCP: Yeni destek modulu yeni service/package olarak eklenir.
3. LSP: RuleProvider gibi portlar ayni kontratla degistirilebilir.
4. ISP: Kucuk interface'ler (RuleProvider) kullanilir.
5. DIP: Application katmani somut implementasyona degil porte bagli.

## Extension Strategy
- Yeni tesvik modulu: `services/<module>-engine`
- Veri modeli gerekiyorsa: `packages/db-core/src/mongodb/schemas/<module>.schema.ts`
- UI bolumu gerekiyorsa: `apps/incentive-ui/src/modules/<module>`

## Runtime Flow
1. CRM verisi `crm-sync-worker` ile MongoDB'ye alinýr.
2. `eligibility-engine` profili degerlendirir.
3. `api-gateway` UI ve dis sistemlere API sunar.
4. `crm-ui` ve `incentive-ui` ayrik gelistirilir.
