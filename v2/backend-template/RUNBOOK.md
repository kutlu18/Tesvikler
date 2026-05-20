# Backend Runbook

## Gereksinim
- .NET 8 SDK

## Restore/Build/Test
```bash
cd v2/backend-template
dotnet restore BackendTemplate.sln
dotnet build BackendTemplate.sln
dotnet test BackendTemplate.sln
```

## API Calistirma
```bash
cd v2/backend-template
dotnet run --project src/Api/BackendTemplate.Api.csproj
```

## Worker Calistirma
```bash
cd v2/backend-template
dotnet run --project src/Workers/SyncWorker/BackendTemplate.Workers.SyncWorker.csproj
dotnet run --project src/Workers/RecalculationWorker/BackendTemplate.Workers.RecalculationWorker.csproj
```
