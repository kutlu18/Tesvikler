# Project Tree

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
