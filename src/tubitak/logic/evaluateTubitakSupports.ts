import { tubitakSupports } from "../data/tubitakSupports";
import {
  ProjectSubjectAnalysis,
  getStoredProjectSubjectAnalysis,
  hasProjectSubjectCategory,
} from "../../core/analysis/projectSubjectAnalysis";
import {
  TubitakFormState,
  TubitakSummary,
  TubitakSupportResult,
  TubitakSupportStatus,
} from "../types";

const suitableArgeScopeText =
  "Güncel çağrı ve uygulama esasları TÜBİTAK resmi sitesinden kontrol edilmelidir.";

const howToGetTemplate = [
  "Firma ve proje ön uygunluk kriterlerini sağlıyor. TÜBİTAK PRODİS kaydı kontrol edilir.",
  "Kuruluş ön kayıt evrakları tamamlanır ve proje öneri formu hazırlanır.",
  "İş paketleri, teknik belirsizlikler, yenilikçi yön, bütçe ve ticarileşme planı yazılır.",
  "Başvuru açık çağrı takvimine göre PRODİS üzerinden gönderilir."
];

const potentialTemplate =
  "Proje konusu destek programına uygun görünüyor ancak çağrı durumu, PRODİS kaydı, firma türü, KOBİ statüsü, proje bütçesi veya teknik yenilik düzeyi doğrulanmadan kesin uygunluk verilemez.";

const notEligibleTemplate =
  "Proje TÜBİTAK Ar-Ge destek mantığına uygun görünmüyor çünkü teknik belirsizlik, yenilikçi yön veya Ar-Ge riski içermiyor. Destekten yararlanmak için proje; yeni ürün/süreç geliştirme, teknik problem, deneysel geliştirme, prototip ve ticarileşme çıktısı içerecek şekilde yeniden kurgulanmalıdır.";

const isCapitalCompany = (form: TubitakFormState): boolean => form.companyType === "Limited" || form.companyType === "Anonim";

const hasArgeProjectCore = (form: TubitakFormState): boolean =>
  (form.hasNewProductDevelopment || form.hasNewProcessDevelopment || form.hasTechImprovement) &&
  form.hasTechnicalUncertainty &&
  form.hasOriginalValue &&
  !form.isRoutineCommercialProject;

const hasArgeExpenseFit = (form: TubitakFormState): boolean =>
  form.hasPersonnelExpense &&
  (form.hasTestAnalysisValidationExpense || form.hasMaterialExpense || form.hasSoftwareLicenseExpense || form.hasMachineryExpense);

const getCompanyAgeFromEstablishmentDate = (date: string): number | null => {
  if (!date) return null;

  const establishedAt = new Date(date);
  if (Number.isNaN(establishedAt.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - establishedAt.getFullYear();
  const monthDiff = now.getMonth() - establishedAt.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < establishedAt.getDate())) {
    years -= 1;
  }

  return Math.max(years, 0);
};

const isRecentlyEstablished = (form: TubitakFormState, maxYears: number): boolean => {
  const age = getCompanyAgeFromEstablishmentDate(form.establishmentDate);
  return age !== null && age <= maxYears;
};

const getArgeScore = (form: TubitakFormState): { score: number; comment: string } => {
  let score = 0;

  if (form.hasTechnicalUncertainty) score += 20;
  if (form.hasOriginalValue) score += 20;
  if (form.hasPrototypeMvpPilotDemo) score += 15;
  if (form.hasCommercializationPlan) score += 15;
  if (hasArgeExpenseFit(form)) score += 10;
  if (form.hasUniversityCollaboration || form.hasCustomerOrganization || form.hasAiDataProviderInstitution) score += 10;
  if (form.inPriorityTechnologyArea || form.hasGreenTransformationScope || form.hasAiOrDeepTechScope || form.expectsPatentOutput) score += 10;

  if (score <= 39) {
    return { score, comment: "0-39: TÜBİTAK Ar-Ge desteği için zayıf" };
  }

  if (score <= 69) {
    return { score, comment: "40-69: Potansiyel, proje kurgusu güçlendirilmeli" };
  }

  return { score, comment: "70-100: Güçlü Ar-Ge destek adayı" };
};

const hasAdministrativeGap = (form: TubitakFormState): boolean => !form.hasProdisRegistration || !form.hasPreRegistrationDocs;

const baseRiskReasons = (form: TubitakFormState): string[] => {
  const reasons: string[] = [];

  if (!form.isTurkeyResident) reasons.push("Firma Türkiye'de yerleşik görünmüyor.");
  if (!isCapitalCompany(form)) reasons.push("Firma sermaye şirketi (Limited/Anonim) niteliğinde görünmüyor.");
  if (form.isSoleProprietorship) reasons.push("Firma şahıs şirketi olduğundan bazı TEYDEB programlarında uygunluk riski bulunur.");
  if (form.isRoutineCommercialProject) reasons.push("Proje rutin ticari/satın alma niteliğinde görünüyor.");
  if (!hasArgeProjectCore(form)) reasons.push("Teknik belirsizlik, özgünlük veya Ar-Ge çekirdeği zayıf görünüyor.");

  return reasons;
};

interface ThemeEval {
  matched: boolean;
  positive: string[];
  negative: string[];
  actions: string[];
  callBased: boolean;
}

const projectSubjectCanPromoteTubitak = (
  analysis: ProjectSubjectAnalysis,
  supportId: string,
): boolean => {
  if (hasProjectSubjectCategory(analysis, "standardPurchaseInstallation")) {
    return false;
  }

  switch (supportId) {
    case "1711":
      return hasProjectSubjectCategory(analysis, "ai") || hasProjectSubjectCategory(analysis, "medtechHealth");
    case "1507":
    case "1501":
      return (
        hasProjectSubjectCategory(analysis, "ai") ||
        hasProjectSubjectCategory(analysis, "softwareSaasPlatform") ||
        hasProjectSubjectCategory(analysis, "medtechHealth") ||
        hasProjectSubjectCategory(analysis, "machineryProductionAutomation") ||
        hasProjectSubjectCategory(analysis, "patentInventionTechTransfer")
      );
    case "1505":
      return (
        hasProjectSubjectCategory(analysis, "universityCollaboration") ||
        hasProjectSubjectCategory(analysis, "medtechHealth")
      );
    case "1602":
    case "1702":
      return hasProjectSubjectCategory(analysis, "patentInventionTechTransfer");
    case "1707":
      return (
        hasProjectSubjectCategory(analysis, "customerOrderPilotCustomer") ||
        hasProjectSubjectCategory(analysis, "medtechHealth")
      );
    case "1831":
    case "1832":
    case "1833":
      return hasProjectSubjectCategory(analysis, "greenTransformationEnergy");
    default:
      return false;
  }
};

const projectSubjectShouldRiskTubitak = (
  analysis: ProjectSubjectAnalysis,
  supportId: string,
): boolean =>
  hasProjectSubjectCategory(analysis, "standardPurchaseInstallation") &&
  ["1507", "1501", "1505", "1509", "1511", "1707", "1711", "1831", "1832", "1833"].includes(supportId);

const hasHardTubitakBlocker = (form: TubitakFormState, supportId: string): boolean => {
  const capitalRequiredPrograms = new Set(["1507", "1501", "1505", "1509", "1511", "1707", "1711", "1832"]);

  if (!form.isTurkeyResident && supportId !== "1514") return true;
  if (capitalRequiredPrograms.has(supportId) && (!isCapitalCompany(form) || form.isSoleProprietorship)) return true;
  if (supportId === "1507" && !form.isKobi) return true;

  return false;
};

const evaluateTheme = (supportId: string, form: TubitakFormState): ThemeEval => {
  const argeCore = hasArgeProjectCore(form);
  const commonNegative = [notEligibleTemplate];

  switch (supportId) {
    case "1507": {
      const matched = form.isKobi && isCapitalCompany(form) && !form.isSoleProprietorship && argeCore;
      return {
        matched,
        positive: [
          "KOBİ ölçeği ve sermaye şirketi yapısı 1507 program profiliyle uyumludur.",
          "Erken dönem Ar-Ge/prototip odaklı proje yapısı 1507 için güçlü sinyal üretir."
        ],
        negative: matched ? [] : [
          "1507 için KOBİ niteliği, sermaye şirketi yapısı ve Ar-Ge çekirdeği birlikte sağlanmalıdır."
        ],
        actions: [
          "Firma KOBİ statüsü ve şirket türü doğrulanmalıdır.",
          "Proje teknik belirsizlik, yenilik ve prototip çıktısı içerecek şekilde yeniden kurgulanmalıdır."
        ],
        callBased: false
      };
    }
    case "1501": {
      const matched = isCapitalCompany(form) && argeCore;
      return {
        matched,
        positive: [
          "Kapsamlı sanayi Ar-Ge kurgusu 1501 için uygundur.",
          "Teknik belirsizlik, özgünlük ve ticarileşme hedefi güçlüdür."
        ],
        negative: matched ? [] : commonNegative,
        actions: [
          "Ar-Ge iş paketleri ve teknik doğrulama planı detaylandırılmalıdır.",
          "Proje bütçesi ve ticarileşme stratejisi 1501 kapsamına göre güçlendirilmelidir."
        ],
        callBased: false
      };
    }
    case "1505": {
      const matched = argeCore && (form.hasUniversityCollaboration || form.hasUniversityServiceProcurement);
      return {
        matched,
        positive: [
          "Üniversite/araştırma kurumu iş birliği 1505'in temel uygunluk unsurudur.",
          "Sanayi ihtiyacı ile akademik çözüm eşleşmesi proje potansiyelini artırır."
        ],
        negative: matched ? [] : ["Üniversite yürütücüsü ve sanayi ortağı kurgusu netleşmeden 1505 uygunluğu zayıf kalır."],
        actions: [
          "Üniversite yürütücüsü ve sanayi ortağıyla ortak iş planı oluşturulmalıdır.",
          "Proje görev dağılımı ve fikri hak paylaşımı erken aşamada netleştirilmelidir."
        ],
        callBased: false
      };
    }
    case "1509": {
      const matched = argeCore && (form.hasInternationalPartner || form.fitsInternationalPrograms);
      return {
        matched,
        positive: [
          "Yurt dışı ortak ve uluslararası çağrı uyumu 1509 için güçlü göstergedir.",
          "Ortak proje planı ve küresel pazar hedefi programla uyumludur."
        ],
        negative: matched ? [] : ["Yabancı ortak ve uluslararası çağrı eşleşmesi olmadan 1509 kesinleşmez."],
        actions: [
          "Yabancı ortak bulunmalı ve ortak proje planı hazırlanmalıdır.",
          "EUREKA/Eurostars/ikili çağrılar düzenli takip edilmelidir."
        ],
        callBased: true
      };
    }
    case "1511": {
      const matched = argeCore && (form.inPriorityTechnologyArea || form.hasAiOrDeepTechScope || form.hasGreenTransformationScope);
      return {
        matched,
        positive: [
          "Proje öncelikli teknoloji/stratejik alanlara temas ediyor.",
          "Yüksek teknoloji ve ithal ikamesi etkisi 1511 için olumlu bir çerçeve sunar."
        ],
        negative: matched ? [] : ["1511 için öncelikli alan çağrısıyla net eşleşme gerekiyor."],
        actions: [
          "Güncel 1511 çağrı metni incelenip proje kapsamı çağrıya hizalanmalıdır."
        ],
        callBased: true
      };
    }
    case "1512-1812": {
      const matched =
        form.hasTechBasedBusinessIdea &&
        (form.isEarlyStageTechStartup || form.foundersNotIncorporatedYet || form.isNewlyIncorporated || isRecentlyEstablished(form, 3));
      return {
        matched,
        positive: [
          "Erken aşama teknoloji girişimi profili BiGG/1812 ile uyumludur.",
          "Yatırım hazırlığı ve ölçeklenebilir iş fikri bu programı güçlendirir."
        ],
        negative: matched ? [] : ["Olgun sanayi şirketi profili bu program için doğrudan uygun olmayabilir."],
        actions: [
          "Teknoloji tabanlı iş fikri, ekip ve yatırım hazırlığı dokümante edilmelidir.",
          "BiGG uygulayıcı kuruluşları ve açık çağrılar takip edilmelidir."
        ],
        callBased: true
      };
    }
    case "1602": {
      const matched = form.expectsPatentOutput;
      return {
        matched,
        positive: ["Patent/faydalı model çıktısı beklentisi 1602 programına doğrudan uyumludur."],
        negative: matched ? [] : ["Patentlenebilir çıktı net değil"],
        actions: [
          "Buluş bildirim formu hazırlanmalı, ön patent araştırması yapılmalı ve patent vekili desteği planlanmalıdır."
        ],
        callBased: false
      };
    }
    case "1702": {
      const matched = form.expectsPatentOutput && (form.hasUniversityCollaboration || form.hasCommercializationPlan);
      return {
        matched,
        positive: ["Patentli/korunabilir teknoloji ve ticarileştirme niyeti 1702 için uygun çerçeve sunar."],
        negative: matched ? [] : ["Patentli teknoloji veya transfer/ticarileştirme kurgusu net değil"],
        actions: [
          "Patent portföyü, lisanslama modeli ve transfer planı oluşturulmalıdır."
        ],
        callBased: true
      };
    }
    case "1707": {
      const matched = form.hasCustomerOrganization && form.isCustomerDrivenProject && (form.customerWillBuyOrUseOutput || form.customerWillContributeBudget);
      return {
        matched,
        positive: [
          "Müşteri kuruluş ihtiyacına dayalı proje yapısı 1707 için güçlü uygunluk sinyalidir.",
          "Müşteri katkısı/satın alma niyeti program beklentisiyle örtüşür."
        ],
        negative: matched ? [] : ["Siparişe dayalı müşteri kuruluş yapısı henüz yeterince net görünmüyor."],
        actions: [
          "Müşteri kuruluş bulunmalı; niyet mektubu, katkı yapısı ve sipariş kurgusu netleştirilmelidir."
        ],
        callBased: true
      };
    }
    case "1711": {
      const matched = form.hasAiOrDeepTechScope && form.hasAiDataProviderInstitution && (form.hasPublicOrLargeDataOwnerInstitution || form.hasForeignCustomerPilotOrResearchPartner);
      return {
        matched,
        positive: [
          "AI kapsamı, veri sağlayıcı kurum ve uygulayıcı/pilot paydaş varlığı 1711 için uygundur.",
          "Model + veri + uygulama kurgusu çağrı beklentisine yakındır."
        ],
        negative: matched ? [] : ["Veri sahibi/uygulayıcı kurum iş birliği olmadan 1711 uygunluğu zayıflar."],
        actions: [
          "Veri sağlayıcı ve uygulayıcı kurumla iş birliği sözleşmesi/niyet yapısı kurulmalıdır.",
          "Yalnızca genel yazılım yerine ölçülebilir AI Ar-Ge hedefleri tanımlanmalıdır."
        ],
        callBased: true
      };
    }
    case "1831": {
      const matched = form.hasGreenTransformationScope || form.improvesEnergyEfficiency || form.reducesCarbonEmission || form.includesCircularEconomy;
      return {
        matched,
        positive: ["Yeşil dönüşüm ihtiyacı ve mentörlük gereksinimi 1831 için uygundur."],
        negative: matched ? [] : ["Yeşil dönüşüm hedefleri net tanımlanmadığı için 1831 uygunluğu sınırlı."],
        actions: ["Yeşil inovasyon yol haritası ve mentörlük ihtiyacı netleştirilmelidir."],
        callBased: true
      };
    }
    case "1832": {
      const matched = (form.includesIndustrialGreenTransformation || form.hasGreenTransformationScope) && isCapitalCompany(form);
      return {
        matched,
        positive: ["Sanayi odaklı yeşil dönüşüm/karbon azaltımı hedefleri 1832 ile uyumludur."],
        negative: matched ? [] : ["Sanayide uygulanabilir yeşil dönüşüm projesi netleşmeden 1832 uygunluğu düşer."],
        actions: ["Proje kapsamı sanayi uygulaması, enerji/kaynak verimliliği ve karbon çıktılarıyla netleştirilmelidir."],
        callBased: true
      };
    }
    case "1833": {
      const matched = form.hasGreenTransformationScope && form.hasUniversityCollaboration && (form.hasCompanyPartnership || form.hasPublicOrLargeDataOwnerInstitution);
      return {
        matched,
        positive: ["Çok paydaşlı yeşil dönüşüm konsorsiyumu 1833 için doğru kurguya yakındır."],
        negative: matched ? [] : ["1833 için konsorsiyum yapısı yeterince olgun değil"],
        actions: ["Firma + üniversite + araştırma/büyük sanayi bileşenlerinden oluşan konsorsiyum kurulmalıdır."],
        callBased: true
      };
    }
    case "1514": {
      const matched =
        form.hasTechBasedBusinessIdea &&
        (form.isEarlyStageTechStartup || form.foundersNotIncorporatedYet || form.isNewlyIncorporated || isRecentlyEstablished(form, 3) || form.needsMentoringOrAcceleration);
      return {
        matched,
        positive: ["Teknoloji girişimi yatırım/fon ekosistemine erişim ihtiyacı 1514 açısından bilgi amaçlı değerlidir."],
        negative: matched ? [] : ["1514 doğrudan klasik firma Ar-Ge proje desteği gibi konumlanmaz."],
        actions: ["Yatırımcı ağı, fon mekanizmaları ve teknoloji girişimi büyüme planı üzerinde çalışılmalıdır."],
        callBased: true
      };
    }
    case "1515": {
      const matched = (form.isLargeEnterprise || form.isArgeOrDesignCenter) && form.projectBudget >= 25000000 && form.projectDurationMonths >= 24;
      return {
        matched,
        positive: ["Büyük ölçekli uzun vadeli Ar-Ge laboratuvar kurgusu 1515 için potansiyel sunar."],
        negative: matched ? [] : ["Küçük/orta ölçekli tekil proje kurgusu 1515 için yetersiz kalabilir."],
        actions: ["Laboratuvar altyapısı, uzun vadeli araştırma planı ve yüksek bütçe yapısı oluşturulmalıdır."],
        callBased: true
      };
    }
    case "uluslararasi": {
      const matched = form.hasInternationalPartner || form.fitsInternationalPrograms || form.targetsGlobalMarket || form.hasForeignCustomerPilotOrResearchPartner;
      return {
        matched,
        positive: ["Uluslararası ortaklık/küresel pazar hedefi EUREKA-Eurostars-Ufuk Avrupa çizgisiyle uyumludur."],
        negative: matched ? [] : ["Uluslararası ortak ve çağrı eşleşmesi olmadan uygunluk sınırlı kalır."],
        actions: [
          "Konsorsiyum ortakları bulunmalı, İngilizce proje dokümantasyonu hazırlanmalı ve çağrı uyumu teyit edilmelidir."
        ],
        callBased: true
      };
    }
    default:
      return {
        matched: false,
        positive: [],
        negative: [notEligibleTemplate],
        actions: ["Program kriterleri güncel çağrı metniyle birlikte yeniden değerlendirilmelidir."],
        callBased: false
      };
  }
};

const resolveStatus = (
  form: TubitakFormState,
  supportId: string,
  theme: ThemeEval,
  shouldBePotentialForCall: boolean,
): TubitakSupportStatus => {
  const capitalRequiredPrograms = new Set(["1507", "1501", "1505", "1509", "1511", "1707", "1711", "1832"]);

  if (!form.isTurkeyResident && supportId !== "1514") return "UYGUN DEĞİL / RİSKLİ";
  if (capitalRequiredPrograms.has(supportId) && (!isCapitalCompany(form) || form.isSoleProprietorship)) return "UYGUN DEĞİL / RİSKLİ";
  if (supportId === "1507" && !form.isKobi) return "UYGUN DEĞİL / RİSKLİ";

  if (!theme.matched) {
    if (theme.callBased) return "POTANSİYEL";
    return "UYGUN DEĞİL / RİSKLİ";
  }

  if (shouldBePotentialForCall) return "POTANSİYEL";

  if (hasAdministrativeGap(form)) return "POTANSİYEL";

  return "UYGUN";
};

export const evaluateTubitakSupports = (form: TubitakFormState): TubitakSupportResult[] => {
  const argeCore = hasArgeProjectCore(form);
  const projectSubjectAnalysis = getStoredProjectSubjectAnalysis();
  const commonRequiredDocs = [
    "PRODİS firma kaydı",
    "Firma ön kayıt evrakları",
    "Proje öneri formu",
    "İş paketleri ve bütçe tablosu",
    "Ticarileşme planı",
    suitableArgeScopeText,
  ];

  return tubitakSupports.map((support) => {
    const theme = evaluateTheme(support.id, form);
    let status = resolveStatus(form, support.id, theme, Boolean(support.callBased));

    const whyEligible = theme.matched ? [...theme.positive] : [];
    const whyNotEligible = !theme.matched ? [...theme.negative] : [];
    const howToBecomeEligible = !theme.matched ? [...theme.actions] : [];

    if (projectSubjectCanPromoteTubitak(projectSubjectAnalysis, support.id)) {
      whyEligible.push("Proje konusu serbest metni bu programin temasi ile uyumlu anahtar kelimeler iceriyor.");

      if (status === "UYGUN DEĞİL / RİSKLİ" && !hasHardTubitakBlocker(form, support.id)) {
        status = "POTANSİYEL";
        whyNotEligible.push("Proje konusu olumlu sinyal uretse de diger teknik/idari kosullar ayrica dogrulanmalidir.");
        howToBecomeEligible.push("Proje konusu ile uyumlu teknik kapsam, iş paketleri ve çağrı koşulları somutlaştırılmalıdır.");
      }
    }

    if (projectSubjectShouldRiskTubitak(projectSubjectAnalysis, support.id)) {
      status = "UYGUN DEĞİL / RİSKLİ";
      whyNotEligible.push("Proje konusu daha cok standart satin alma/kurulum sinyali verdigi icin Ar-Ge destek uygunlugu zayiflar.");
      howToBecomeEligible.push("Rutin satin alma yerine teknik belirsizlik, gelistirme, prototip ve dogrulama iceren Ar-Ge kurgusu kurulmalidir.");
    }

    if (status === "POTANSİYEL" && hasAdministrativeGap(form)) {
      whyNotEligible.push("PRODİS kaydı veya ön kayıt evrakları eksik olduğundan kesin uygunluk verilemedi.");
      howToBecomeEligible.push("PRODİS kaydı tamamlanmalı ve kuruluş ön kayıt evrakları eksiksiz hazırlanmalıdır.");
    }

    if (!form.isTurkeyResident && status !== "UYGUN") {
      whyNotEligible.push("Firma Türkiye'de yerleşik olmadığı için sanayi desteklerinde uygunluk zayıftır.");
    }

    if (!argeCore && ["1507", "1501", "1505", "1509", "1511", "1707", "1711"].includes(support.id)) {
      whyNotEligible.push("Proje Ar-Ge çekirdeği (teknik belirsizlik + özgünlük + yenilikçi geliştirme) açısından zayıf görünüyor.");
    }

    if (status === "UYGUN" && whyEligible.length === 0) {
      whyEligible.push("Firma ve proje ön uygunluk kriterleri programla uyumlu görünüyor.");
    }

    if (status === "UYGUN DEĞİL / RİSKLİ" && whyNotEligible.length === 0) {
      whyNotEligible.push(notEligibleTemplate);
      howToBecomeEligible.push("Proje Ar-Ge niteliği güçlendirilerek yeniden ön değerlendirme yapılmalıdır.");
    }

    if (support.callBased) {
      whyNotEligible.push("Çağrı bazlı program olduğundan güncel çağrı dokümanı kontrolü olmadan kesin uygunluk verilemez.");
      howToBecomeEligible.push("Güncel çağrı metni, uygulama esasları ve takvim bilgileri TÜBİTAK resmi kaynaklarından doğrulanmalıdır.");
    }

    const riskParts: string[] = [suitableArgeScopeText];

    if (form.hasTaxOrSgkDebt) {
      riskParts.push("Vergi/SGK borcu mali uygunluk ve sözleşme sürecinde risk oluşturabilir; borç durumu yönetilmelidir.");
    }

    if (form.isRoutineCommercialProject) {
      riskParts.push("Rutin/ticari proje niteliği Ar-Ge destek değerlendirmesinde red riski doğurur.");
    }

    const howToGet = status === "UYGUN" ? [...howToGetTemplate] : status === "POTANSİYEL" ? [potentialTemplate, ...howToGetTemplate] : [];

    const nextAction =
      status === "UYGUN"
        ? "Program özel başvuru dosyasını tamamlayıp çağrı takvimine göre PRODİS üzerinden başvuruyu yapın."
        : status === "POTANSİYEL"
          ? "Eksik kayıt/evrak/çağrı uygunluğu doğrulamalarını tamamlayıp teknik proje kurgusunu güçlendirin."
          : "Proje kapsamını Ar-Ge odaklı hale getirip teknik belirsizlik, yenilik ve prototip çıktılarıyla yeniden tasarlayın.";

    return {
      id: support.id,
      supportName: support.supportName,
      status,
      institution: support.institution,
      programCode: support.programCode,
      supportType: support.supportType,
      applicantProfile: support.applicantProfile,
      projectType: support.projectType,
      supportedExpenses: support.supportedExpenses,
      estimatedSupportStructure: support.estimatedSupportStructure,
      whyEligible,
      howToGet,
      whyNotEligible,
      howToBecomeEligible,
      requiredDocuments: commonRequiredDocs,
      applicationChannel: support.applicationChannel,
      nextAction,
      riskNote: riskParts.join(" "),
      callCheckRequired: Boolean(support.callBased),
    };
  });
};

export const summarizeTubitakResults = (results: TubitakSupportResult[], form: TubitakFormState): TubitakSummary => {
  const uygunCount = results.filter((item) => item.status === "UYGUN").length;
  const potansiyelCount = results.filter((item) => item.status === "POTANSİYEL").length;
  const riskliCount = results.filter((item) => item.status === "UYGUN DEĞİL / RİSKLİ").length;
  const callCheckCount = results.filter((item) => item.callCheckRequired).length;
  const projectSubjectAnalysis = getStoredProjectSubjectAnalysis();
  const arge = getArgeScore(form);
  const projectSubjectBonus =
    hasProjectSubjectCategory(projectSubjectAnalysis, "ai") ||
    hasProjectSubjectCategory(projectSubjectAnalysis, "softwareSaasPlatform") ||
    hasProjectSubjectCategory(projectSubjectAnalysis, "medtechHealth") ||
    hasProjectSubjectCategory(projectSubjectAnalysis, "greenTransformationEnergy") ||
    hasProjectSubjectCategory(projectSubjectAnalysis, "patentInventionTechTransfer")
      ? 5
      : 0;
  const argeScore = Math.min(100, arge.score + projectSubjectBonus);
  const argeScoreComment =
    projectSubjectBonus > 0
      ? `${arge.comment} Proje konusu anahtar kelimeleri destek uyumunu artırıyor.`
      : arge.comment;

  return {
    uygunCount,
    potansiyelCount,
    riskliCount,
    argeScore,
    argeScoreComment,
    callCheckCount,
  };
};

export const getBaseTubitakRiskReasons = (form: TubitakFormState): string[] => baseRiskReasons(form);




