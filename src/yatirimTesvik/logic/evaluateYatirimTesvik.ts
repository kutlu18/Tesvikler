import { yatirimTesvikSupports } from "../data/yatirimTesvikSupports";
import {
  ProjectSubjectAnalysis,
  getStoredSharedProjectSubject,
  hasProjectSubjectCategory,
  mergeProjectSubjectAnalyses,
} from "../../core/analysis/projectSubjectAnalysis";
import {
  ScoreInfo,
  YatirimTesvikFormState,
  YatirimTesvikResult,
  YatirimTesvikStatus,
  YatirimTesvikSummary,
} from "../types";

const mevzuatUyari =
  "Güncel mevzuat, destek oranları, destek süreleri ve başvuru şartları Sanayi ve Teknoloji Bakanlığı resmi kaynaklarından kontrol edilmelidir.";

const uygunAciklama = [
  "Yatırım konusu ve temel bilgiler ön uygunluk kriterlerini sağlıyor.",
  "E-TUYS yetkilendirmesi yapılır, yatırımcı bilgileri sisteme tanımlanır.",
  "Yatırım projesi, makine-teçhizat listesi, proforma faturalar, kapasite/fizibilite bilgileri hazırlanır.",
  "Başvuru Sanayi ve Teknoloji Bakanlığı E-TUYS sistemi üzerinden yapılır.",
  "Belge onaylandıktan sonra harcamalar belge kapsamına uygun şekilde gerçekleştirilir.",
];

const potansiyelAciklama =
  "Yatırım konusu destek sistemine uygun olabilir; ancak il/ilçe, sektör, NACE/US-97/GTİP, asgari sabit yatırım tutarı, OSB durumu, E-TUYS yetkilendirmesi veya açık program koşulları doğrulanmadan kesin uygunluk verilemez.";

const uygunDegilAciklama =
  "Yatırım şu an yatırım teşvik sistemi açısından uygun görünmüyor çünkü yatırım tutarı yetersiz, yatırım konusu desteklenmeyen alan olabilir, harcamalar belge öncesinde yapılmış olabilir veya yatırım stratejik/teknolojik/bölgesel kriterleri sağlamıyor. Destekten yararlanmak için yatırım konusu, tutarı, yeri, makine listesi ve başvuru zamanı teşvik mevzuatına uygun şekilde yeniden kurgulanmalıdır.";

const hasCoreInvestmentInfo = (form: YatirimTesvikFormState): boolean =>
  Boolean(form.investmentSubject.trim()) && form.investmentAmount > 0 && form.isInvestmentLocationKnown && Boolean(form.investmentCity.trim());

interface InvestmentSubjectSignals {
  highTech: boolean;
  green: boolean;
  service: boolean;
  exportOrImportSubstitution: boolean;
  strategic: boolean;
  localDevelopment: boolean;
}

interface AdvancedAreaSignals {
  highTech: boolean;
  green: boolean;
  strategic: boolean;
  digital: boolean;
}

interface RegionalCategorySignals {
  hasSelection: boolean;
  developed: boolean;
  disadvantaged: boolean;
  specialSupport: boolean;
}

const toSubjectSignals = (subject: string): InvestmentSubjectSignals => {
  const text = subject.toLocaleLowerCase("tr-TR");
  const has = (...keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

  return {
    highTech: has("yüksek teknoloji", "yarı iletken", "batarya", "elektronik", "yazılım", "otomasyon", "ar-ge", "teknoloji"),
    green: has("yeşil", "enerji verimliliği", "karbon", "yenilenebilir enerji", "enerji altyapısı"),
    service: has("turizm", "sağlık", "eğitim", "hizmet", "lojistik", "depolama"),
    exportOrImportSubstitution: has("ihracat", "ithal ikamesi", "stratejik ürün", "tedarik zinciri"),
    strategic: has("stratejik", "kritik", "ithal ikamesi", "yarı iletken", "batarya", "yüksek teknoloji"),
    localDevelopment: has("tarım", "gıda", "kırsal", "yerel", "istihdam"),
  };
};

const toAdvancedAreaSignals = (advancedArea: string): AdvancedAreaSignals => {
  const text = advancedArea.toLocaleLowerCase("tr-TR");
  const has = (...keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

  return {
    highTech: has("savunma", "havacılık", "batarya", "yarı iletken", "mikroelektronik", "biyoteknoloji", "medikal", "yapay zekâ", "robotik", "nanoteknoloji"),
    green: has("enerji", "yenilenebilir", "batarya"),
    strategic: has("savunma", "yarı iletken", "kritik maden", "batarya", "havacılık"),
    digital: has("yapay zekâ", "veri", "mikroelektronik", "otomasyon", "robotik"),
  };
};

const toRegionalCategorySignals = (regionalCategory: string): RegionalCategorySignals => {
  const text = regionalCategory.toLocaleLowerCase("tr-TR");
  const has = (...keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

  return {
    hasSelection: text.trim().length > 0,
    developed: has("gelişmiş", "1-2"),
    disadvantaged: has("dezavantajlı", "5-6"),
    specialSupport: has("deprem", "özel destek", "osb"),
  };
};

const hasDocumentSet = (form: YatirimTesvikFormState): boolean =>
  form.hasMachineryList && form.hasProformaInvoices && form.hasFinancialFeasibility;

const hasTechnologyStrategicFit = (form: YatirimTesvikFormState): boolean => {
  const subjectSignals = toSubjectSignals(form.investmentSubject);
  const advancedAreaSignals = toAdvancedAreaSignals(form.advancedTechnologyArea);
  return (
    subjectSignals.highTech ||
    subjectSignals.strategic ||
    subjectSignals.green ||
    subjectSignals.exportOrImportSubstitution ||
    advancedAreaSignals.highTech ||
    advancedAreaSignals.green ||
    advancedAreaSignals.strategic ||
    advancedAreaSignals.digital ||
    form.isMediumHighOrHighTech ||
    form.alignsWithPriorityProductLists ||
    form.fitsTechnologyHamlesi ||
    form.fitsStrategicHamle ||
    form.fitsLocalDevelopmentHamlesi ||
    form.hasStrategicOrCriticalTechnology
  );
};

const isCallBasedPotentialOnly = (supportId: string): boolean =>
  [
    "oncelikli",
    "hedef",
    "teknolojiHamlesi",
    "yerelKalkinma",
    "stratejikHamle",
    "projeBazli",
  ].includes(supportId);

const getSuitabilityScore = (form: YatirimTesvikFormState): ScoreInfo => {
  let score = 0;
  const regionalSignals = toRegionalCategorySignals(form.regionalCategory);

  if (form.isInvestmentLocationKnown && form.investmentCity.trim()) score += 10;
  if (form.investmentSubject.trim()) score += 10;
  if (form.meetsMinimumFixedInvestment) score += 15;
  if (hasDocumentSet(form)) score += 15;
  if (form.spendingTiming === "BelgeSonrasi") score += 15;
  if (form.isInOsb || form.mayGetSubRegionSupport || form.isInDisasterRegion || regionalSignals.disadvantaged || regionalSignals.specialSupport) {
    score += 10;
  } else if (regionalSignals.developed) {
    score += 5;
  }
  if (hasTechnologyStrategicFit(form)) score += 15;
  if (form.createsNewEmployment && form.expectedNewEmploymentCount > 0) score += 10;

  if (score <= 39) return { score, comment: "0-39: Yatırım teşvik başvurusu için zayıf / ciddi eksik var" };
  if (score <= 69) return { score, comment: "40-69: Potansiyel, yatırım kurgusu ve belge seti güçlendirilmeli" };
  return { score, comment: "70-100: Güçlü yatırım teşvik adayı" };
};

const getETuysReadinessScore = (form: YatirimTesvikFormState): ScoreInfo => {
  let score = 0;

  if (form.hasETuysAuthorization) score += 25;
  if (form.isInvestmentLocationKnown && form.investmentCity.trim()) score += 15;
  if (form.hasMachineryList) score += 20;
  if (form.hasProformaInvoices) score += 15;
  if (form.hasCapacityReport || form.hasFinancialFeasibility) score += 15;
  if (form.hasFinancialFeasibility || form.willUseCredit || form.willUseLeasing) score += 10;

  if (score <= 39) return { score, comment: "0-39: E-TUYS başvurusuna hazır değil" };
  if (score <= 69) return { score, comment: "40-69: Eksik belgeler tamamlanmalı" };
  return { score, comment: "70-100: Başvuru hazırlığı güçlü" };
};

interface ThemeEvaluation {
  matched: boolean;
  reasons: string[];
  blockers: string[];
  actions: string[];
}

const projectSubjectCanPromoteYatirim = (
  analysis: ProjectSubjectAnalysis,
  supportId: string,
): boolean => {
  switch (supportId) {
    case "genel":
    case "bolgesel":
      return (
        hasProjectSubjectCategory(analysis, "machineryProductionAutomation") ||
        hasProjectSubjectCategory(analysis, "agriFoodLivestock") ||
        hasProjectSubjectCategory(analysis, "standardPurchaseInstallation")
      );
    case "oncelikli":
    case "yesil":
      return hasProjectSubjectCategory(analysis, "greenTransformationEnergy");
    case "teknolojiHamlesi":
    case "hedef":
      return (
        hasProjectSubjectCategory(analysis, "ai") ||
        hasProjectSubjectCategory(analysis, "medtechHealth") ||
        hasProjectSubjectCategory(analysis, "machineryProductionAutomation")
      );
    case "hizmet":
      return hasProjectSubjectCategory(analysis, "serviceExport");
    default:
      return false;
  }
};

const evaluateTheme = (supportId: string, form: YatirimTesvikFormState): ThemeEvaluation => {
  const baseActions = [
    "Yatırım konusu, yatırım tutarı ve yer bilgisi netleştirilmeli.",
    "Makine listesi, proforma faturalar ve fizibilite dosyası hazırlanmalıdır.",
  ];
  const subjectSignals = toSubjectSignals(form.investmentSubject);
  const advancedAreaSignals = toAdvancedAreaSignals(form.advancedTechnologyArea);
  const regionalSignals = toRegionalCategorySignals(form.regionalCategory);

  switch (supportId) {
    case "genel": {
      const matched = hasCoreInvestmentInfo(form) && form.meetsMinimumFixedInvestment;
      return {
        matched,
        reasons: [
          "Asgari sabit yatırım ve temel yatırım bilgileri genel teşvik değerlendirmesine uygundur.",
          "KDV istisnası ve gümrük vergisi muafiyeti potansiyeli oluşuyor.",
        ],
        blockers: matched ? [] : ["Asgari sabit yatırım tutarı veya temel yatırım bilgileri eksik/yetersiz."],
        actions: baseActions,
      };
    }
    case "bolgesel": {
      const matched =
        hasCoreInvestmentInfo(form) &&
        form.meetsMinimumFixedInvestment &&
        Boolean(form.investmentDistrict.trim()) &&
        regionalSignals.hasSelection;
      const categoryReason =
        regionalSignals.disadvantaged || regionalSignals.specialSupport
          ? "Seçilen bölgesel kategori, daha güçlü bölgesel/alt bölge destek potansiyeline işaret ediyor."
          : regionalSignals.developed
            ? "Seçilen bölgesel kategori bölgesel teşvik analizinde dikkate alındı."
            : "Bölgesel kategori seçimi bölgesel teşvik analizine dahil edildi.";
      return {
        matched,
        reasons: [
          "İl/ilçe, yatırım konusu ve yatırım tutarı bölgesel teşvik analizi için yeterli çerçeve sunuyor.",
          "OSB/alt bölge/deprem bölgesi etkisi destek avantajı oluşturabilir.",
          categoryReason,
        ],
        blockers: matched
          ? []
          : [
              "İl/ilçe/sektör/asgari yatırım bilgisi veya bölgesel kategori seçimi tamamlanmadan bölgesel kesin uygunluk verilemez.",
            ],
        actions: [
          "İl, ilçe, sektör, bölgesel kategori ve OSB durumuna göre güncel destek haritası kontrol edilmelidir.",
          ...baseActions,
        ],
      };
    }
    case "oncelikli": {
      const matched =
        form.isInServicePriorityAreas ||
        form.isMediumHighOrHighTech ||
        form.hasEnergyExpense ||
        form.hasStrategicOrCriticalTechnology ||
        subjectSignals.highTech ||
        subjectSignals.green ||
        subjectSignals.strategic ||
        advancedAreaSignals.highTech ||
        advancedAreaSignals.green ||
        advancedAreaSignals.strategic;
      return {
        matched,
        reasons: [
          "Yatırım öncelikli alanlarla ilişkili görünüyor.",
          "Öncelikli yatırım listeleriyle eşleşme halinde destek seviyesi artabilir.",
        ],
        blockers: matched ? [] : ["Öncelikli yatırım kapsamı netleşmediği için bu başlık zayıf."],
        actions: ["Öncelikli yatırım konuları listesi ve ek mevzuat maddeleri kontrol edilmelidir.", ...baseActions],
      };
    }
    case "hedef": {
      const matched =
        form.isMediumHighOrHighTech ||
        form.hasExportPotential ||
        form.hasImportSubstitutionImpact ||
        subjectSignals.highTech ||
        subjectSignals.exportOrImportSubstitution ||
        advancedAreaSignals.highTech ||
        advancedAreaSignals.strategic ||
        advancedAreaSignals.digital;
      return {
        matched,
        reasons: ["Yüksek katma değer, yerlileştirme veya ihracat etkisi hedef yatırım yaklaşımını destekliyor."],
        blockers: matched ? [] : ["Sektörel odak/teknoloji etkisi net olmadışı için hedef yatırım uygunluşu zayıf."],
        actions: ["Sektör odaklı güncel listeler ve çağrı kriterleriyle yatırım konusu hizalanmalıdır."],
      };
    }
    case "teknolojiHamlesi": {
      const matched =
        (form.fitsTechnologyHamlesi || subjectSignals.highTech) &&
        (
          form.isMediumHighOrHighTech ||
          form.includesHighTechProduction ||
          form.alignsWithPriorityProductLists ||
          subjectSignals.highTech ||
          advancedAreaSignals.highTech ||
          advancedAreaSignals.digital
        );
      return {
        matched,
        reasons: ["Orta-yüksek/yüksek teknoloji ve öncelikli ürün uyumu Teknoloji Hamlesi için güçlü sinyaldir."],
        blockers: matched ? [] : ["Ürün kodu/teknoloji alanı/çağrı uyumu netleşmeden Teknoloji Hamlesi uygunluğu kesinleşmez."],
        actions: [
          "Ürün kodu, teknoloji alanı, üretim planı ve fizibilite dosyası hazırlanmalıdır.",
          "Program çağrıları düzenli izlenmelidir.",
        ],
      };
    }
    case "yerelKalkinma": {
      const matched =
        (form.fitsLocalDevelopmentHamlesi || subjectSignals.localDevelopment) &&
        form.alignsWithLocalProgramTopics &&
        form.investmentCity.trim().length > 0 &&
        regionalSignals.hasSelection;
      return {
        matched,
        reasons: ["Yatırımın il bazlı yerel yatırım konularıyla uyumu yerel kalkınma başlığını güçlendiriyor."],
        blockers: matched ? [] : ["İl bazlı program konusu, bölgesel kategori veya uyum net deşil."],
        actions: [
          "İlgili ilin yerel yatırım konuları listesi ve bölgesel kategori etkisi kontrol edilmeli, proje konusu eşleştirilmelidir.",
          "Yerel istihdam, tedarik zinciri ve ihracat etkisi dokümante edilmelidir.",
        ],
      };
    }
    case "stratejikHamle": {
      const matched =
        (form.fitsStrategicHamle || subjectSignals.strategic) &&
        (form.hasStrategicOrCriticalTechnology || subjectSignals.strategic || advancedAreaSignals.strategic) &&
        (form.hasImportSubstitutionImpact || form.hasCurrentAccountDeficitReductionImpact || subjectSignals.exportOrImportSubstitution) &&
        form.investmentAmount >= 50000000;

      return {
        matched,
        reasons: ["İthal ikamesi, cari açık azaltımı ve kritik teknoloji etkisi stratejik hamle profiliyle uyumlu."],
        blockers: matched ? [] : ["Stratejik ölçek/etki veya yatırım büyüklüşü yeterince güçlü deşil."],
        actions: ["Stratejik ürün etkisi, ekonomik katkı ve büyük ölçek kriterleri fizibilite ile güçlendirilmelidir."],
      };
    }
    case "projeBazli": {
      const matched = form.fitsProjectBasedScale && form.investmentAmount >= 200000000 && form.createsHighAddedValue;
      return {
        matched,
        reasons: ["Çok büyük ölçek ve ülke ekonomisine kritik etki varsayımı proje bazlı sistem için uygundur."],
        blockers: matched ? [] : ["Normal KOBİ veya rutin yatırım ölçeşi proje bazlı teşvik için yeterli görünmüyor."],
        actions: ["Komite değerlendirmesine uygun etki analizi, ölçek ve stratejik katkı dosyası hazırlanmalıdır."],
      };
    }
    case "yesil": {
      const matched =
        form.hasEnergyExpense ||
        form.hasInfrastructureExpense ||
        form.hasStrategicOrCriticalTechnology ||
        form.isInServicePriorityAreas ||
        subjectSignals.green ||
        advancedAreaSignals.green;
      return {
        matched,
        reasons: ["Enerji verimliliği/yeşil dönüşüm odaklı yatırım niteliği yatırım teşvik kapsamında değerlendirilebilir."],
        blockers: matched ? [] : ["Yeşil dönüşüm veya enerji verimlilişi etkisi net deşil."],
        actions: ["Enerji etüdü, teknik rapor ve yeşil dönüşüm fizibilitesi hazırlanmalıdır."],
      };
    }
    case "hizmet": {
      const matched = (form.isServiceSector || subjectSignals.service) && (form.isInServicePriorityAreas || subjectSignals.service) && hasCoreInvestmentInfo(form);
      return {
        matched,
        reasons: ["Hizmet sektöründe mevzuatta desteklenen yatırım konusuna yakın bir kurgu var."],
        blockers: matched ? [] : ["Hizmet yatırım konusunun mevzuatta desteklenen alanlarla uyumu belirsiz."],
        actions: ["Yatırım yeri, ruhsat/izin, kapasite ve asgari yatırım tutarı kontrol edilmelidir."],
      };
    }
    case "ithalMakine": {
      const matched = form.hasImportedMachinery && form.hasMachineryList && form.hasProformaInvoices;
      return {
        matched,
        reasons: ["İthal makine varlığı gümrük muafiyeti ve KDV istisnası açısından uygun zemin oluşturuyor."],
        blockers: matched ? [] : ["İthal makine listesi/GTİP/proforma seti olmadan bu başlık netleşmez."],
        actions: ["GTİP uygunluğu, yerli-ithal makine ayrımı ve Bakanlık onayı için liste detaylandırılmalıdır."],
      };
    }
    case "sgkVergi": {
      const matched = form.createsNewEmployment && form.expectedNewEmploymentCount > 0 && form.meetsMinimumFixedInvestment;
      return {
        matched,
        reasons: ["Yeni istihdam ve yatırım ölçeği SGK/vergi avantajlarının potansiyelini artırıyor."],
        blockers: matched ? [] : ["İstihdam artışı veya yatırım ölçeşi netleşmeden SGK/vergi avantajı kesinleşmez."],
        actions: ["Belge kapsamı, istihdam projeksiyonu ve bölgesel vergi indirimi şartları birlikte kontrol edilmelidir."],
      };
    }
    default:
      return { matched: false, reasons: [], blockers: [uygunDegilAciklama], actions: ["Yatırım kurgusu güncel mevzuata göre revize edilmelidir."] };
  }
};

const resolveStatus = (form: YatirimTesvikFormState, supportId: string, matched: boolean): YatirimTesvikStatus => {
  if (!form.isTurkeyResident) return "UYGUN DEĞİL / RİSKLİ";
  if (!matched) {
    return isCallBasedPotentialOnly(supportId) ? "POTANSİYEL" : "UYGUN DEĞİL / RİSKLİ";
  }

  if (!form.hasETuysAuthorization) return "POTANSİYEL";
  if (!hasCoreInvestmentInfo(form)) return "POTANSİYEL";
  if (!form.meetsMinimumFixedInvestment && ["genel", "bolgesel", "sgkVergi"].includes(supportId)) return "POTANSİYEL";
  if (isCallBasedPotentialOnly(supportId)) return "POTANSİYEL";

  return "UYGUN";
};

export const evaluateYatirimTesvik = (form: YatirimTesvikFormState): YatirimTesvikResult[] => {
  const projectSubjectAnalysis = mergeProjectSubjectAnalyses(form.investmentSubject, getStoredSharedProjectSubject());
  const requiredDocuments = [
    "E-TUYS yetkilendirme evrakları",
    "Yatırımcı firma bilgileri",
    "İmza sirküleri / yetki belgeleri",
    "Ticaret sicil gazetesi",
    "Vergi levhası",
    "SGK/vergi borç durumu",
    "Yatırım bilgi formu",
    "Makine-teçhizat listesi",
    "Yerli/ithal makine ayrımı",
    "Proforma faturalar",
    "GTİP bilgileri",
    "Kapasite raporu",
    "Fizibilite raporu",
    "Finansman planı",
    "Arsa tapusu / kira sözleşmesi / tahsis yazısı",
    "İnşaat ruhsatı veya izin belgeleri",
    "ÇED gerekli değildir / ÇED olumlu belgesi (gerekiyorsa)",
    "OSB yer tahsis yazısı (varsa)",
    "Sektörel izin ve ruhsatlar",
  ];

  return yatirimTesvikSupports.map((support) => {
    const theme = evaluateTheme(support.id, form);
    let status = resolveStatus(form, support.id, theme.matched);

    const whyEligible = theme.matched ? [...theme.reasons] : [];
    const whyNotEligible = !theme.matched ? [...theme.blockers] : [];
    const howToBecomeEligible = !theme.matched ? [...theme.actions] : [];

    if (projectSubjectCanPromoteYatirim(projectSubjectAnalysis, support.id)) {
      whyEligible.push("Yatirim/proje konusu metni bu tesvik basligi ile uyumlu tematik sinyal uretiyor.");

      if (status === "UYGUN DEĞİL / RİSKLİ" && form.isTurkeyResident) {
        status = "POTANSİYEL";
        whyNotEligible.push("Konu uyumu olumlu olsa da il, ilce, belge ve mevzuat kosullari ayrica teyit edilmelidir.");
        howToBecomeEligible.push("Konuya uygun yatirim plani, makine listesi ve mevzuat eslestirmesi guclendirilmelidir.");
      }
    }

    if (!form.hasETuysAuthorization && status !== "UYGUN DEĞİL / RİSKLİ") {
      whyNotEligible.push("E-TUYS yetkilendirmesi tamamlanmadan başvuru kesinleşemez.");
      howToBecomeEligible.push("E-TUYS yetkilendirmesi ve kullanıcı tanımlama işlemleri tamamlanmalıdır.");
    }

    if (!toRegionalCategorySignals(form.regionalCategory).hasSelection && ["bolgesel", "yerelKalkinma"].includes(support.id)) {
      whyNotEligible.push("Bölgesel kategori seçimi yapılmadığı için bölgesel/yerel kalkınma uygunluğu zayıfladı.");
      howToBecomeEligible.push("Bölgesel kategori alanından uygun seçimi yaparak il/ilçe analizini güçlendirin.");
    }

    if (!form.hasMachineryList || !form.hasProformaInvoices || !form.hasFinancialFeasibility || !form.hasCapacityReport) {
      whyNotEligible.push("Makine listesi, proforma faturalar, kapasite raporu veya fizibilite setinde eksik belge riski bulunuyor.");
      howToBecomeEligible.push("Makine listesi, proforma faturalar, kapasite raporu ve fizibilite/finansman planı tamamlanmalıdır.");
    }

    if (form.hasPreCertificateExpenses || form.spendingTiming === "BelgeOncesi" || form.importProcessesStarted || form.invoicesIssued) {
      whyNotEligible.push("Belge öncesi harcama/ithalat/fatura riski nedeniyle KDV-gümrük-vergi avantajlarının bir kısmı kaybedilebilir.");
      howToBecomeEligible.push("Belge öncesi harcamalar ayrıştırılmalı, mümkün olan harcamalar belge onayı sonrasına planlanmalıdır.");
    }

    if (status === "POTANSİYEL" && isCallBasedPotentialOnly(support.id)) {
      whyNotEligible.push("Bu başlık çağrı/liste/komite bazlı olduğundan kesin uygunluk verilmez.");
      howToBecomeEligible.push("Açık çağrı, program listesi ve komite değerlendirme şartları güncel olarak doğrulanmalıdır.");
    }

    const howToGet =
      status === "UYGUN"
        ? [...uygunAciklama]
        : status === "POTANSİYEL"
          ? [potansiyelAciklama, ...uygunAciklama]
          : [];

    if (status === "UYGUN DEĞİL / RİSKLİ" && whyNotEligible.length === 0) {
      whyNotEligible.push(uygunDegilAciklama);
    }

    if (status === "UYGUN DEĞİL / RİSKLİ" && howToBecomeEligible.length === 0) {
      howToBecomeEligible.push("Yatırım konusu, yatırım tutarı, yatırım yeri ve başvuru zamanlaması mevzuata göre yeniden kurgulanmalıdır.");
    }

    let riskNote = mevzuatUyari;

    if (form.hasTaxOrSgkDebt) {
      riskNote += " Vergi/SGK borcu uygulama ve yararlanma aşamasında risk yaratabilir; borç durumu yönetilmelidir.";
    }

    if (form.hasPreCertificateExpenses || form.spendingTiming === "BelgeOncesi") {
      riskNote += " Belge öncesi harcamalar teşvik unsurlarının bir kısmının uygulanamaması riskini artırır.";
    }

    const nextAction =
      status === "UYGUN"
        ? "E-TUYS başvuru dosyasını tamamlayıp belge başvurusunu gerçekleştirin ve harcamaları belge kapsamına göre yönetin."
        : status === "POTANSİYEL"
          ? "Eksik bilgi/belge, E-TUYS yetkilendirme ve mevzuat kontrollerini tamamlayıp teşvik türünü netleştirin."
          : "Yatırım kurgusunu tutar-konu-yer-belge zamanlaması açısından revize ederek yeniden ön değerlendirme yapın.";

    return {
      id: support.id,
      supportType: support.supportType,
      status,
      institution: support.institution,
      legalFramework: support.legalFramework,
      applicantProfile: support.applicantProfile,
      suitableInvestmentType: support.suitableInvestmentType,
      supportElements: support.supportElements,
      whyEligible,
      howToGet,
      whyNotEligible,
      howToBecomeEligible,
      requiredDocuments,
      applicationChannel: support.applicationChannel,
      nextAction,
      riskNote,
    };
  });
};

export const summarizeYatirimTesvik = (
  results: YatirimTesvikResult[],
  form: YatirimTesvikFormState,
): YatirimTesvikSummary => {
  const uygunCount = results.filter((item) => item.status === "UYGUN").length;
  const potansiyelCount = results.filter((item) => item.status === "POTANSİYEL").length;
  const riskliCount = results.filter((item) => item.status === "UYGUN DEĞİL / RİSKLİ").length;

  const preCertificateSpendingRisk =
    form.hasPreCertificateExpenses || form.spendingTiming === "BelgeOncesi" || form.importProcessesStarted || form.invoicesIssued
      ? "Yüksek"
      : form.spendingTiming === "Karisik"
        ? "Orta"
        : "Düşük";

  return {
    uygunCount,
    potansiyelCount,
    riskliCount,
    preCertificateSpendingRisk,
    etuysReadiness: getETuysReadinessScore(form),
    suitabilityScore: getSuitabilityScore(form),
  };
};




