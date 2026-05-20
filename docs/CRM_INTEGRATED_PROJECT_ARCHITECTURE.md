# CRM Entegre Teşvik Platformu - Proje Mimarisi

Bu doküman, CRM içinde yönetilen müvekkil verilerini kullanarak SGK, mali, hukuki ve teşvik uygunluk analizleri yapan, ardından yatırım/ihracat fırsatı önerisi ve teklif üreten bir platform için **geniş perspektifli ve esnek** mimari çerçeve sunar.

## 1) Hedef Mimari Yaklaşım

Öneri: **Modüler Monolith (başlangıç)** + **Event-Driven entegrasyon** + gerektiğinde **servisleşme**.

Neden:
- Başlangıçta ekip/operasyon maliyeti düşük.
- Domain sınırları baştan doğru çizilirse mikroservise geçiş kolay.
- CRM ile entegrasyon ihtiyacını API + event üzerinden rahat karşılar.

## 2) Ana Domain Bounded Context'leri

- `Identity & Access`
: Kullanıcı, rol, tenant, yetkilendirme, audit.
- `CRM Sync & Client Master`
: Müvekkil temel kayıtları, kişi/şirket, iletişim, segment, risk profili.
- `Compliance Operations`
: SGK, mali ve hukuki operasyon görevleri, takvim, doküman, durum.
- `Rules & Eligibility Engine`
: Teşvik kuralları, soru setleri, skorlar, kararlar, versiyonlama.
- `Opportunity Intelligence`
: Uygun destek/fırsat üretimi, önceliklendirme, aksiyon önerisi.
- `Proposal & Pipeline`
: Teklif üretimi, onay, revizyon, satış pipeline ve sonuç takibi.
- `Document & Evidence`
: Belge sınıflama, doğrulama, kanıt setleri, saklama politikası.
- `Integration Hub`
: CRM, muhasebe/ERP, e-imza, DYS/E-TUYS vb. dış sistem adaptörleri.
- `Reporting & Analytics`
: KPI, kullanım metrikleri, dönüşüm, destek başarı oranı.

## 3) Katmanlı Uygulama Yapısı (SOLID + Clean)

- `Domain`
: Entity, ValueObject, DomainEvent, aggregate kuralları.
- `Application`
: Use-case servisleri, command/query handler, DTO.
- `Infrastructure`
: EF Core, repository implementasyonları, mesajlaşma, dış servis client.
- `API`
: REST/GraphQL endpoint, auth, validation.
- `Worker`
: Kuyruk tüketimi, senkronizasyon, periyodik iş.

## 4) CRM Entegrasyon Stratejisi

### 4.1 Entegrasyon modeli
- **Primary path**: REST/Webhook
- **Asenkron path**: Event bus (Outbox + consumer)

### 4.2 Anti-Corruption Layer (ACL)
CRM verisini doğrudan domain'e yazmayın; önce ACL mapleyip normalize edin.

Örnek akış:
1. CRM'den `ClientUpdated` webhook gelir.
2. ACL mapper `ExternalClient` -> `ClientMaster` dönüşümü yapar.
3. `ClientProfileChanged` domain event yayınlanır.
4. Eligibility Engine yeniden analiz tetikler.

### 4.3 İdempotency ve tutarlılık
- `ExternalSystem + ExternalId` unique constraint
- Webhook/event için `IdempotencyKey`
- Outbox pattern ile "write + publish" atomikliği

## 5) NFR (Non-Functional Requirements)

- Çok kiracılı yapı (`TenantId` zorunlu)
- Audit trail (kim, neyi, ne zaman değiştirdi)
- KVKK/GDPR uyumu için veri sınıflandırma
- Rule versioning (mevzuat değişince geçmiş analiz bozulmaz)
- Soft delete + legal retention
- Observability: log, metric, trace

## 6) Proje Ağacı (Önerilen)

```text
src/
  Api/
    Controllers/
    Contracts/
    Middleware/

  Application/
    Common/
    Identity/
    CrmSync/
    Compliance/
    Eligibility/
    Opportunity/
    Proposal/
    Documents/
    Analytics/

  Domain/
    Common/
    Identity/
    ClientMaster/
    Compliance/
    Eligibility/
    Opportunity/
    Proposal/
    Documents/

  Infrastructure/
    Persistence/
      AppDbContext.cs
      Configurations/
      Migrations/
      Seed/
    Integrations/
      Crm/
      Dys/
      ETuys/
      ESignature/
    Messaging/
      Outbox/
      Consumers/
    Storage/

  Workers/
    SyncWorker/
    RecalculationWorker/

  Shared/
    Contracts/
    Events/
    ValueObjects/

tests/
  Unit/
  Integration/
  Contract/
```

## 7) Modül Ekleme Standardı

Yeni fırsat modülü (ör. "Kalkınma Ajansı") ekleneceğinde:
1. `Domain/Eligibility` altına yeni rule package ekle.
2. `Application/Eligibility` içinde handler + query ekle.
3. `Infrastructure/Persistence/Seed` ile soru + destek metadata seed et.
4. `API` endpoint aç.
5. UI modül registry'ye yeni modülü bağla.

## 8) Tavsiye Edilen Teknik Prensipler

- CQRS (okuma-yazma ayrımı)
- Specification pattern (rule filtreleri)
- Strategy pattern (modül bazlı değerlendirme)
- Factory (teklif üretim formatları)
- Pipeline behavior (validation, logging, transaction)

## 9) Veri Akışı (Özet)

1. CRM müvekkil verisi gelir/senkronize olur.
2. Müvekkil profil değişikliği analiz kuyruğunu tetikler.
3. Eligibility Engine rule set + soru-cevap + belgelerle sonucu hesaplar.
4. Opportunity modülü sıralı fırsat listesi ve risk notu üretir.
5. Proposal modülü teklif taslağı oluşturur.
6. CRM'e geri yazım (opsiyonel): fırsat/teklif özeti.

## 10) Roadmap

- Faz 1: Modüler monolith + tek DB + outbox
- Faz 2: Read model ayrımı + analytics DB
- Faz 3: Yüksek hacimde Eligibility ve Proposal servislerinin ayrıştırılması
