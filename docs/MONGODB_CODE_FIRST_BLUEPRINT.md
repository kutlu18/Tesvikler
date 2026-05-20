# MongoDB Code First Blueprint (CRM Entegre)

Bu backend iskeleti, CRM'den gelen müvekkil verisini alıp teşvik uygunluk motorunda kullanmak için hazırlanmıştır.

## Stack
- Node.js + TypeScript
- Express
- Mongoose (Code First)
- MongoDB

## Hedefler
- One-to-many ve many-to-many ilişki desteği
- Multi-tenant (`tenantId`)
- Modüler domain yapısı
- CRM senkronuna uygun `external ref` modeli
- Event-driven entegrasyon (`inbound_events`, `outbox_messages`)

## Koleksiyon Grupları
- Identity: `tenants`, `users`, `roles`, `user_role_assignments`
- CRM: `clients`, `client_contacts`, `client_external_refs`, `client_tags`, `client_tag_map`
- Eligibility: `modules`, `rule_sets`, `questions`, `analyses`, `analysis_answers`, `support_programs`, `analysis_recommendations`, `document_requirements`, `support_program_document_requirements`
- Proposal/Pipeline: `opportunities`, `proposals`, `proposal_versions`
- Integration: `inbound_events`, `outbox_messages`

## Relation Örnekleri
- 1-N: `Client -> Analyses`, `Analysis -> AnalysisAnswers`
- N-N: `Analysis <-> SupportProgram` (join: `analysis_recommendations`)
- N-N: `SupportProgram <-> DocumentRequirement` (join: `support_program_document_requirements`)
- N-N: `User <-> Role` (join: `user_role_assignments`)

## Project Tree (Server)

```text
server/
  package.json
  tsconfig.json
  .env.example
  src/
    index.ts
    config/
      env.ts
      database.ts
    models/
      common.ts
      index.ts
      identity/
        tenant.model.ts
        user.model.ts
        role.model.ts
        user-role-assignment.model.ts
      crm/
        client.model.ts
        client-contact.model.ts
        client-external-ref.model.ts
        client-tag.model.ts
      eligibility/
        module.model.ts
        question.model.ts
        analysis.model.ts
        support-program.model.ts
      proposal/
        proposal.model.ts
      integration/
        event.model.ts
    scripts/
      seed-support-programs.ts
```

## Çalıştırma

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Seed:

```bash
npm run seed
```

## Notlar
- CRM webhook/event işleme için `inbound_events` idempotency index içerir.
- Gelecekte read-model ayrımı için Mongo secondary read veya ayrı analytics DB eklenebilir.
- Bu iskelet mevcut frontend modüllerini bozmadan bağımsız backend katmanı sağlar.
