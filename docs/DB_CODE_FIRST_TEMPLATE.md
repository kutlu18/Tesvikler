# Code First DB Şablonu (One-to-Many / Many-to-Many Uyumlu)

Bu doküman, mevcut teşvik modülleri (SGK, KOSGEB, TÜBİTAK, Yatırım, Ticaret) için geliştirilebilir bir **Code First** veritabanı iskeleti verir.

Önerilen stack:
- ORM: `EF Core`
- DB: `PostgreSQL` (veya SQL Server)
- Yaklaşım: `Code First + Migration`

## 1) Tasarım Hedefleri

- Modül eklemeye açık yapı (Open/Closed)
- Güçlü ilişki modeli (1-N ve N-N)
- Analiz geçmişi ve versiyonlama
- Sonuçların denetlenebilirliği (audit-friendly)

## 2) Çekirdek Domain Modeli

### Ana tablolar
- `UserAccount`
- `Company`
- `Analysis`
- `AnalysisModule`
- `Question`
- `QuestionOption`
- `Answer`
- `SupportProgram`
- `AnalysisSupportRecommendation`
- `DocumentRequirement`
- `SupportProgramDocumentRequirement` (N-N join)

## 3) İlişkiler

### One-to-Many (1-N)
- `UserAccount 1 -> N Company`
- `Company 1 -> N Analysis`
- `Analysis 1 -> N Answer`
- `Question 1 -> N QuestionOption`

### Many-to-Many (N-N)
- `Analysis N <-> N SupportProgram` (join: `AnalysisSupportRecommendation`)
- `SupportProgram N <-> N DocumentRequirement` (join: `SupportProgramDocumentRequirement`)

## 4) Önerilen Entity Şablonu (EF Core)

```csharp
public enum ModuleType
{
    SGK = 1,
    KOSGEB = 2,
    TUBITAK = 3,
    YATIRIM = 4,
    TICARET = 5
}

public enum EligibilityStatus
{
    Uygun = 1,
    Potansiyel = 2,
    Riskli = 3
}

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
}

public class UserAccount : BaseEntity
{
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;

    public ICollection<Company> Companies { get; set; } = new List<Company>();
}

public class Company : BaseEntity
{
    public Guid OwnerUserId { get; set; }
    public UserAccount OwnerUser { get; set; } = null!;

    public string Name { get; set; } = null!;
    public string TaxNumber { get; set; } = null!;
    public string MersisNo { get; set; } = null!;

    public ICollection<Analysis> Analyses { get; set; } = new List<Analysis>();
}

public class Analysis : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public ModuleType ModuleType { get; set; }
    public int FormVersion { get; set; } = 1;
    public decimal? SuitabilityScore { get; set; }

    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    public ICollection<AnalysisSupportRecommendation> Recommendations { get; set; } = new List<AnalysisSupportRecommendation>();
}

public class Question : BaseEntity
{
    public ModuleType ModuleType { get; set; }
    public string GroupCode { get; set; } = null!;
    public string Code { get; set; } = null!; // unique in module
    public string Text { get; set; } = null!;
    public string InputType { get; set; } = null!; // bool/select/number/text

    public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
}

public class QuestionOption : BaseEntity
{
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    public string Value { get; set; } = null!;
    public string Label { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class Answer : BaseEntity
{
    public Guid AnalysisId { get; set; }
    public Analysis Analysis { get; set; } = null!;

    public Guid QuestionId { get; set; }
    public string? ValueText { get; set; }
    public decimal? ValueNumber { get; set; }
    public bool? ValueBool { get; set; }
    public string? ValueJson { get; set; } // multi-select vb.
}

public class SupportProgram : BaseEntity
{
    public ModuleType ModuleType { get; set; }
    public string Code { get; set; } = null!; // örn: KOSGEB_GIRISIMCI
    public string Name { get; set; } = null!;
    public string LegalBasis { get; set; } = null!;

    public ICollection<AnalysisSupportRecommendation> Recommendations { get; set; } = new List<AnalysisSupportRecommendation>();
    public ICollection<SupportProgramDocumentRequirement> RequiredDocuments { get; set; } = new List<SupportProgramDocumentRequirement>();
}

public class AnalysisSupportRecommendation : BaseEntity
{
    public Guid AnalysisId { get; set; }
    public Analysis Analysis { get; set; } = null!;

    public Guid SupportProgramId { get; set; }
    public SupportProgram SupportProgram { get; set; } = null!;

    public EligibilityStatus Status { get; set; }
    public string ReasonSummary { get; set; } = null!;
    public string NextAction { get; set; } = null!;
    public string RiskNote { get; set; } = null!;
}

public class DocumentRequirement : BaseEntity
{
    public string Code { get; set; } = null!; // FATURA, DEKONT vb.
    public string Name { get; set; } = null!;

    public ICollection<SupportProgramDocumentRequirement> SupportPrograms { get; set; } = new List<SupportProgramDocumentRequirement>();
}

public class SupportProgramDocumentRequirement
{
    public Guid SupportProgramId { get; set; }
    public SupportProgram SupportProgram { get; set; } = null!;

    public Guid DocumentRequirementId { get; set; }
    public DocumentRequirement DocumentRequirement { get; set; } = null!;

    public bool IsMandatory { get; set; }
}
```

## 5) DbContext Mapping Şablonu

```csharp
public class AppDbContext : DbContext
{
    public DbSet<UserAccount> Users => Set<UserAccount>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Analysis> Analyses => Set<Analysis>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<SupportProgram> SupportPrograms => Set<SupportProgram>();
    public DbSet<AnalysisSupportRecommendation> AnalysisSupportRecommendations => Set<AnalysisSupportRecommendation>();
    public DbSet<DocumentRequirement> DocumentRequirements => Set<DocumentRequirement>();
    public DbSet<SupportProgramDocumentRequirement> SupportProgramDocumentRequirements => Set<SupportProgramDocumentRequirement>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<UserAccount>().HasIndex(x => x.Email).IsUnique();
        b.Entity<Company>().HasIndex(x => x.TaxNumber).IsUnique();

        b.Entity<Question>().HasIndex(x => new { x.ModuleType, x.Code }).IsUnique();
        b.Entity<SupportProgram>().HasIndex(x => new { x.ModuleType, x.Code }).IsUnique();

        b.Entity<SupportProgramDocumentRequirement>()
            .HasKey(x => new { x.SupportProgramId, x.DocumentRequirementId });

        b.Entity<AnalysisSupportRecommendation>()
            .HasIndex(x => new { x.AnalysisId, x.SupportProgramId })
            .IsUnique();

        b.Entity<Answer>()
            .HasIndex(x => new { x.AnalysisId, x.QuestionId })
            .IsUnique();
    }
}
```

## 6) Migration Akışı

```bash
# İlk migration
 dotnet ef migrations add InitialCreate
 dotnet ef database update

# Yeni modül/alan eklendiğinde
 dotnet ef migrations add AddTicaretModuleFields
 dotnet ef database update
```

## 7) Modül Ekleme Kuralı

Yeni modül (ör. "Finansman") eklendiğinde:
1. `ModuleType` enum'a yeni değer ekle.
2. `Question` seed verisi ekle.
3. `SupportProgram` seed verisi ekle.
4. Modülün değerlendirme servisi (application layer) eklenir.
5. Mevcut tablo yapısı bozulmadan yeni kayıtlarla ilerlenir.

## 8) Seed Stratejisi

- `Question`, `QuestionOption`, `SupportProgram`, `DocumentRequirement` tabloları seed edilir.
- Kod tabanındaki form/logic ile DB seed `Code` alanları birebir eşleşir.
- `FormVersion` ile kırıcı soru değişiklikleri yönetilir.

## 9) Dizin Önerisi (Backend için)

```text
src/
  Domain/
    Entities/
    Enums/
  Application/
    Services/
    DTOs/
  Infrastructure/
    Persistence/
      AppDbContext.cs
      Configurations/
      Migrations/
      Seeds/
  API/
    Controllers/
```

## 10) Minimum Veri Bütünlüğü Kuralları

- Her `Analysis` için `CompanyId` zorunlu
- Her `Answer` için `AnalysisId + QuestionId` tekil
- Her `Recommendation` için `AnalysisId + SupportProgramId` tekil
- `SupportProgram` kodları modül bazında tekil
- Belgelerde `Code` tekil

---

Bu şablon, modül sayısı arttıkça tablo patlamasını önler ve one-to-many / many-to-many ilişkileri temiz yönetir.
