import { ticaretSupports } from "../data/ticaretSupports";
import {
  ProjectSubjectAnalysis,
  getStoredProjectSubjectAnalysis,
  hasProjectSubjectCategory,
} from "../../core/analysis/projectSubjectAnalysis";
import {
  ScoreInfo,
  TicaretFormState,
  TicaretSummary,
  TicaretSupportClass,
  TicaretSupportDefinition,
  TicaretSupportResult,
  TicaretSupportSelection,
  TicaretSupportStatus,
} from "../types";

const policyWarning =
  "Ticaret Bakanlığı desteklerinde üst limitler, oranlar, başvuru süreleri ve başvuru mercii dönemsel olarak güncellenebilir. Güncel bilgi Ticaret Bakanlığı resmi destek sayfaları ve ilgili genelgelerden kontrol edilmelidir.";

const eligibleFlow = [
  "Firma ve harcama ön uygunluk kriterlerini sağlıyor.",
  "DYS/KEP/e-imza altyapısı kontrol edilir.",
  "İlgili destek için başvuru mercii ve süre belirlenir.",
  "Fatura, dekont, sözleşme, faaliyet kanıtı, görsel/rapor çıktısı ve hedef pazar belgeleri hazırlanır.",
  "Başvuru Ticaret Bakanlığı sistemi, ihracatçı birliği veya ilgili başvuru mercii üzerinden yapılır.",
];

const potentialFlow =
  "Destek konusu uygun görünüyor ancak DYS kaydı, ihracatçı birliği üyeliği, statü tanımı, açık genelge şartları, başvuru süresi, belge seti veya harcamanın uygunluğu doğrulanmadan kesin uygunluk verilemez.";

const notEligibleFlow =
  "Destek şu an uygun görünmüyor çünkü ihracat/e-ihracat/hizmet ihracatı niteliği oluşmamış, harcama hedef pazara yönelik değil, belge seti eksik, başvuru süresi kaçırılmış veya gider başka bir destekten karşılanmış olabilir. Destekten yararlanmak için faaliyet ve harcama yapısı destek mevzuatına uygun şekilde yeniden kurgulanmalıdır.";

const selectedClassSet = (selection: TicaretSupportSelection): Set<TicaretSupportClass> => {
  const set = new Set<TicaretSupportClass>();
  if (selection.mal) set.add("MAL");
  if (selection.eihracat) set.add("EIHRACAT");
  if (selection.hizmet) set.add("HIZMET");
  return set;
};

const hasAnyMalActivity = (f: TicaretFormState): boolean =>
  f.hasPhysicalProductExport || f.currentlyExports || f.wantsNewMarketEntry || f.wantsFindForeignCustomers;

const hasAnyEihracatActivity = (f: TicaretFormState): boolean =>
  f.sellsOnlineAbroad || f.isEExporter || f.sellsViaMarketplace || f.sellsViaOwnEcommerceSite;

const hasAnyServiceActivity = (f: TicaretFormState): boolean =>
  f.providesServiceExport || f.isServiceExporter || f.serviceDeliveredToForeignCustomer;

const hasDysInfra = (f: TicaretFormState): boolean =>
  f.hasDys && f.hasKep && f.hasESignOrFinancialSeal && f.hasMersisCurrent;

const hasBasicEvidence = (f: TicaretFormState): boolean =>
  f.hasInvoicesDecotsContractsAndProof && f.paymentsFromCompanyBankAccount && f.canDocumentCollectionsViaBank;

const isSpendingComplianceStrong = (f: TicaretFormState): boolean =>
  f.expenseTargetsForeignMarket && f.withinApplicationTimeLimit && (!f.expenseIncurred || f.checkedPreApprovalOrOnayRequirement);

const hasStatusOrMembership = (f: TicaretFormState): boolean =>
  f.isExporterUnionMember || f.isServiceExporter || f.isEExporter || f.isCommercialExporter;

const computeExportSuitabilityScore = (f: TicaretFormState): ScoreInfo => {
  let score = 0;

  if (f.isTurkeyResident) score += 10;
  if (hasAnyMalActivity(f) || hasAnyEihracatActivity(f) || hasAnyServiceActivity(f)) score += 15;
  if (f.hasTargetMarkets && (f.wantsNewMarketEntry || f.currentlyExports || f.sellsOnlineAbroad || f.providesServiceExport)) score += 15;
  if (hasDysInfra(f)) score += 15;
  if (f.hasInvoicesDecotsContractsAndProof && f.hasDigitalDocumentArchive) score += 15;
  if (isSpendingComplianceStrong(f)) score += 15;
  if (hasStatusOrMembership(f)) score += 10;
  if (f.notFundedByOtherPublicSupport) score += 5;

  if (score <= 39) return { score, comment: "0-39: Ticaret Bakanlığı destekleri için zayıf / ciddi eksik var" };
  if (score <= 69) return { score, comment: "40-69: Potansiyel, belge ve başvuru altyapısı güçlendirilmeli" };
  return { score, comment: "70-100: Güçlü destek adayı" };
};

const computeDysReadiness = (f: TicaretFormState): ScoreInfo => {
  let score = 0;

  if (f.hasDys) score += 25;
  if (f.hasKep) score += 15;
  if (f.hasESignOrFinancialSeal) score += 15;
  if (f.hasMersisCurrent) score += 10;
  if (f.isExporterUnionMember) score += 15;
  if (f.hasDigitalDocumentArchive) score += 10;
  if (f.canDocumentCollectionsViaBank) score += 10;

  if (score <= 39) return { score, comment: "0-39: Başvuru altyapısı hazır değil" };
  if (score <= 69) return { score, comment: "40-69: Eksik başvuru altyapısı tamamlanmalı" };
  return { score, comment: "70-100: Başvuru hazırlığı güçlü" };
};

const computeMissingDocumentCount = (f: TicaretFormState): number => {
  const checks = [
    f.hasDys,
    f.hasKep,
    f.hasESignOrFinancialSeal,
    f.hasMersisCurrent,
    f.isExporterUnionMember,
    f.hasInvoicesDecotsContractsAndProof,
    f.paymentsFromCompanyBankAccount,
    f.canDocumentCollectionsViaBank,
    f.hasDigitalDocumentArchive,
    f.knowsApplicationAuthority,
    f.knowsDysKepEsignSubmissionPath,
    f.knowsGtipNaceOrServiceCode,
  ];

  return checks.filter((item) => !item).length;
};

const getGeneralRiskNotes = (f: TicaretFormState): string[] => {
  const notes: string[] = [policyWarning];

  if (f.hasTaxOrSgkDebt) {
    notes.push("Vergi/SGK borcu ödeme aşaması ve başvuru kontrollerinde risk yaratabilir.");
  }

  if (f.expenseIncurred && !f.checkedPreApprovalOrOnayRequirement) {
    notes.push("Harcama öncesi onay/süreç kontrolü yapılmadığı için destek uygunluk riski artar.");
  }

  if (f.expenseIncurred && !f.withinApplicationTimeLimit) {
    notes.push("Başvuru süresi riski nedeniyle harcamanın desteklenmeme ihtimali vardır.");
  }

  if (!f.notFundedByOtherPublicSupport) {
    notes.push("Aynı giderin başka kamu desteğiyle karşılanması mükerrer destek riski doğurur.");
  }

  return notes;
};

const commonDocuments = [
  "DYS kayıt ve kullanıcı bilgileri",
  "KEP adresi",
  "e-imza / mali mühür",
  "MERSİS kayıtları",
  "İhracatçı birliği üyeliği",
  "Vergi levhası",
  "Ticaret sicil gazetesi",
  "İmza sirküleri",
  "Faaliyet belgesi",
  "Fatura",
  "Banka dekontu / ödeme belgesi",
  "Sözleşme",
  "Proforma / teklif",
  "Hedef pazar bilgisi",
  "Ürün GTİP bilgisi",
  "Hizmet sözleşmesi",
  "Yurt dışı müşteri faturası",
  "Döviz tahsilat belgesi",
  "Fuar katılım sözleşmesi",
  "Katılımcı belgesi",
  "Stand görselleri",
  "Reklam kampanya raporları",
  "Ekran görüntüleri",
  "Pazaryeri satış/komisyon raporları",
  "Lojistik / ETGB / mikro ihracat belgeleri",
  "Marka tescil belgeleri",
  "Belgelendirme/test/analiz raporları",
  "Yurt dışı birim kira sözleşmesi",
  "Sağlık turizmi yetki belgeleri (gerekiyorsa)",
];

interface MatchInfo {
  matched: boolean;
  reasons: string[];
  blockers: string[];
  actions: string[];
}

const projectSubjectCanPromoteTicaret = (
  analysis: ProjectSubjectAnalysis,
  support: TicaretSupportDefinition,
): boolean => {
  if (
    hasProjectSubjectCategory(analysis, "exportEexportMarketplace") &&
    (support.supportClass === "MAL" || support.supportClass === "EIHRACAT")
  ) {
    return true;
  }

  if (
    hasProjectSubjectCategory(analysis, "serviceExport") &&
    support.supportClass === "HIZMET"
  ) {
    return true;
  }

  if (
    hasProjectSubjectCategory(analysis, "softwareSaasPlatform") &&
    (support.id === "hizmet-bilisim" || support.supportClass === "EIHRACAT")
  ) {
    return true;
  }

  if (hasProjectSubjectCategory(analysis, "medtechHealth") && support.id === "hizmet-saglik") {
    return true;
  }

  return false;
};

const matchSupport = (s: TicaretSupportDefinition, f: TicaretFormState): MatchInfo => {
  const mal = hasAnyMalActivity(f);
  const ei = hasAnyEihracatActivity(f);
  const hs = hasAnyServiceActivity(f);

  switch (s.id) {
    case "mal-pazara-giris-belgesi":
      return {
        matched: mal && (f.needsMarketEntryCertificate || f.needsCeFdaIsoEtc),
        reasons: ["Hedef pazarda sertifika/test/belge ihtiyacı bulunduğu için destek konusuyla uyumlu."],
        blockers: ["Belgelendirme ihtiyacı netleşmeden bu destek için uygunluk oluşmaz."],
        actions: ["Hedef ülke belge gereklilikleri ve test planı netleştirilmelidir."],
      };
    case "mal-marka-tescil":
      return { matched: mal && f.plansForeignTrademarkRegistration, reasons: ["Yurt dışı marka tescil planı mevcut."], blockers: ["Yurt dışı marka tescil planı yok."], actions: ["Hedef ülkelerde marka tescil takvimi hazırlanmalıdır."] };
    case "mal-pazara-giris-projesi":
      return { matched: mal && f.wantsNewMarketEntry && f.hasExportStrategyPlan, reasons: ["Yeni pazara giriş ve proje planı var."], blockers: ["Pazar giriş proje kurgusu eksik."], actions: ["Pazar giriş projesi ve hedef KPI seti hazırlanmalıdır."] };
    case "mal-pazar-arastirma":
      return { matched: mal && (f.wantsNewMarketEntry || f.wantsFindForeignCustomers), reasons: ["Yeni pazar/müşteri arayışı mevcut."], blockers: ["Pazar araştırması ihtiyacı net değil."], actions: ["Hedef ülke ve müşteri segmenti netleştirilmelidir."] };
    case "mal-yurtdisi-fuar":
      return { matched: mal && f.plansOverseasFairParticipation, reasons: ["Yurt dışı fuar katılım planı var."], blockers: ["Yurt dışı fuar planı yok."], actions: ["Fuar takvimi ve katılım bütçesi hazırlanmalıdır."] };
    case "mal-yurtici-fuar":
      return { matched: mal && f.plansDomesticInternationalFairParticipation, reasons: ["Yurt içi uluslararası fuar planı var."], blockers: ["Yurt içi uluslararası fuar planı yok."], actions: ["Uygun fuar listesi ve takvimi belirlenmelidir."] };
    case "mal-heyet":
      return { matched: mal && f.wantsTradeDelegationParticipation, reasons: ["Sektörel ticaret/alım heyeti katılım niyeti mevcut."], blockers: ["Heyet katılım planı bulunmuyor."], actions: ["İlgili heyet programları ve başvuru koşulları takip edilmelidir."] };
    case "mal-yurtdisi-kira":
      return { matched: mal && (f.plansForeignUnitOpening || f.willHaveForeignRentExpense), reasons: ["Yurt dışı birim/kira gideri planı mevcut."], blockers: ["Yurt dışı birim açılışı veya kira gideri görünmüyor."], actions: ["Birim açılış modeli ve kira sözleşme planı hazırlanmalıdır."] };
    case "mal-tanitim":
      return { matched: mal && f.plansForeignPromotionAndAds, reasons: ["Yurt dışı tanıtım/reklam planı var."], blockers: ["Tanıtım kampanyası planı net değil."], actions: ["Kampanya planı, kanallar ve ölçümleme seti hazırlanmalıdır."] };
    case "mal-sirket-marka-alim":
      return { matched: mal && f.plansForeignCompanyOrBrandAcquisition, reasons: ["Yurt dışı şirket/marka alım hedefi mevcut."], blockers: ["Şirket/marka alım planı yok."], actions: ["Alım hedefi, değerleme ve hukuki süreç planı hazırlanmalıdır."] };
    case "mal-kuresel-tedarik":
      return { matched: mal && f.wantsGlobalSupplyChainParticipation, reasons: ["Küresel tedarik zinciri hedefi var."], blockers: ["Küresel tedarik zinciri hedefi görünmüyor."], actions: ["Tedarikçi uyum gereklilikleri ve müşteri beklentileri netleştirilmelidir."] };
    case "mal-tasarim-urun":
    case "mal-tasarim-ofisi":
      return { matched: mal && f.needsDesignCollectionDevelopment, reasons: ["Tasarım/ürün geliştirme ihtiyacı mevcut."], blockers: ["Tasarım ve koleksiyon geliştirme planı yok."], actions: ["Tasarım yol haritası ve çıktı planı hazırlanmalıdır."] };
    case "mal-marka-turquality":
      return { matched: mal && f.hasTurqualityGoal, reasons: ["Global marka/TURQUALITY hedefi mevcut."], blockers: ["Markalaşma programı seviyesi hedefi net değil."], actions: ["Markalaşma olgunluk değerlendirmesi ve program ön hazırlığı yapılmalıdır."] };
    case "mal-urge":
    case "mal-konsorsiyum":
      return { matched: mal && f.fitsUrgeOrExportConsortium, reasons: ["UR-GE/konsorsiyum türü iş birliği potansiyeli bulunuyor."], blockers: ["İş birliği kuruluşu/konsorsiyum yapısı net değil."], actions: ["İş birliği kuruluşu veya konsorsiyum modeli oluşturulmalıdır."] };
    case "mal-responsible":
      return { matched: mal && (f.needsResponsibleGreenCompliance || f.hasCbamOrSustainabilityRisk), reasons: ["Yeşil mutabakat/CBAM uyum ihtiyacı tespit edilmiş."], blockers: ["Responsible/yeşil uyum ihtiyacı net değil."], actions: ["Sürdürülebilirlik ve uyum yol haritası hazırlanmalıdır."] };
    case "mal-rapor":
      return { matched: mal && f.hasTargetMarkets && (f.wantsNewMarketEntry || f.wantsFindForeignCustomers), reasons: ["Hedef pazar ve rapor ihtiyacı mevcut."], blockers: ["Hedef pazar veya rapor ihtiyacı net değil."], actions: ["Pazar raporu kapsamı ve hedef ülke listesi belirlenmelidir."] };

    case "e-tanitim":
      return { matched: ei && f.runsDigitalAdsAbroad, reasons: ["Yurt dışı dijital reklam faaliyeti var."], blockers: ["Dijital reklam faaliyeti görünmüyor."], actions: ["Hedef ülke bazlı dijital kampanya planı hazırlanmalıdır."] };
    case "e-komisyon":
      return { matched: ei && f.sellsViaMarketplace && f.paysMarketplaceCommissions, reasons: ["Pazaryeri komisyon gideri mevcut."], blockers: ["Pazaryeri komisyon gideri yok veya belgelenemiyor."], actions: ["Pazaryeri komisyon raporları düzenli arşivlenmelidir."] };
    case "e-konsorsiyum":
      return { matched: ei && f.canBeEexportConsortium, reasons: ["E-ihracat konsorsiyumu statüsü potansiyeli var."], blockers: ["E-ihracat konsorsiyumu statüsü net değil."], actions: ["Konsorsiyum statüsü ve uygunluk şartları doğrulanmalıdır."] };
    case "e-site":
      return { matched: ei && f.sellsViaOwnEcommerceSite && f.isRetailEcommerceSite, reasons: ["Kendi perakende e-ticaret sitesi ile yurt dışı satış yapılıyor."], blockers: ["Perakende e-ticaret sitesi modeli net değil."], actions: ["Site operasyon modeli ve satış raporlaması netleştirilmelidir."] };
    case "e-pazaryeri":
      return { matched: ei && f.sellsViaMarketplace, reasons: ["Yurt dışı pazaryeri satışı mevcut."], blockers: ["Pazaryeri satışı görünmüyor."], actions: ["Hedef pazaryeri stratejisi ve satış raporları hazırlanmalıdır."] };
    case "e-entegrasyon-listeleme":
      return { matched: ei && (f.buildsEexportSoftwareIntegration || f.hasLocalizationContentCosts), reasons: ["Entegrasyon/listeleme/lokalizasyon ihtiyacı mevcut."], blockers: ["Entegrasyon veya listeleme ihtiyacı net değil."], actions: ["Pazaryeri entegrasyon ve listeleme planı hazırlanmalıdır."] };
    case "e-fulfillment":
      return { matched: ei && f.usesForeignFulfillmentOrReturnCenter, reasons: ["Yurt dışı fulfillment/iade merkezi kullanımı var."], blockers: ["Fulfillment/depo kullanımı görünmüyor."], actions: ["Lojistik-fulfillment süreçleri ve maliyetleri belgelenmelidir."] };
    case "e-rapor-danismanlik":
      return { matched: ei && (f.hasTargetCountryDigitalPlan || f.wantsNewMarketEntry), reasons: ["Hedef ülke dijital planı/danışmanlık ihtiyacı mevcut."], blockers: ["Hedef ülke planı veya danışmanlık ihtiyacı net değil."], actions: ["E-ihracat pazar giriş planı ve danışmanlık kapsamı hazırlanmalıdır."] };
    case "e-lokalizasyon":
      return { matched: ei && (f.hasLocalizationContentCosts || f.plansForeignTrademarkOrDomain), reasons: ["Lokalizasyon/çeviri/içerik giderleri mevcut."], blockers: ["Lokalizasyon veya içerik gideri görünmüyor."], actions: ["Ürün içerikleri hedef ülke diline ve kültürüne uyarlanmalıdır."] };
    case "e-heyet":
      return { matched: ei && (f.wantsTradeDelegationParticipation || f.hasTargetCountryDigitalPlan), reasons: ["E-ihracat odaklı heyet/sanal heyet potansiyeli var."], blockers: ["Heyet/sanal heyet katılım planı net değil."], actions: ["İlgili heyet programları ve başvuru koşulları takip edilmelidir."] };

    case "hizmet-bilisim":
      return { matched: hs && (f.serviceSector === "BilisimYazilimSaaS" || f.hasSaasLicenseSubscriptionExport), reasons: ["Bilişim/yazılım/SaaS hizmet ihracatı sinyali var."], blockers: ["Bilişim/SaaS hizmet ihracatı niteliği net değil."], actions: ["Sözleşme, lisans/abonelik ve yurt dışı faturalama altyapısı güçlendirilmelidir."] };
    case "hizmet-oyun":
      return { matched: hs && (f.serviceSector === "Oyun" || f.hasGameRevenueAndPublisherAgreements), reasons: ["Oyun/dijital gelir ve yurt dışı kullanıcı/publisher yapısı mevcut."], blockers: ["Oyun gelir modeli veya publisher sözleşmesi net değil."], actions: ["Store gelir raporları ve publisher anlaşmaları belgelendirilmelidir."] };
    case "hizmet-saglik":
      return { matched: hs && (f.serviceSector === "SaglikTurizmi" || f.hasHealthTourismAuthorizationProcess), reasons: ["Sağlık turizmi ve yetki süreci sinyalleri mevcut."], blockers: ["Sağlık turizmi yetki/operasyon koşulları net değil."], actions: ["HealthTürkiye ve sektör yetki belgeleri tamamlanmalıdır."] };
    case "hizmet-egitim":
      return { matched: hs && (f.serviceSector === "Egitim" || f.hasInternationalEducationRevenue), reasons: ["Uluslararası eğitim hizmet geliri potansiyeli bulunuyor."], blockers: ["Eğitim hizmet ihracatı geliri/operasyonu net değil."], actions: ["Uluslararası öğrenci/program gelir belgeleri hazırlanmalıdır."] };
    case "hizmet-yonetim":
      return { matched: hs && f.serviceSector === "YonetimDanismanligi", reasons: ["Yönetim danışmanlığı hizmet ihracatı profili mevcut."], blockers: ["Yönetim danışmanlığı hizmet ihracatı niteliği net değil."], actions: ["Yurt dışı müşteri sözleşmeleri ve faturalama belgeleri hazırlanmalıdır."] };
    case "hizmet-teknik":
      return { matched: hs && f.serviceSector === "TeknikMusavirlik", reasons: ["Teknik müşavirlik/mühendislik/mimarlık hizmet ihracatı uygunluğu var."], blockers: ["Teknik hizmet ihracatı niteliği net değil."], actions: ["Proje sözleşmeleri, raporlar ve yurt dışı hizmet kanıtları hazırlanmalıdır."] };
    case "hizmet-lojistik":
      return { matched: hs && f.serviceSector === "Lojistik", reasons: ["Lojistik hizmet ihracatı profili mevcut."], blockers: ["Lojistik hizmet ihracatı niteliği net değil."], actions: ["Yurt dışı lojistik hizmet sözleşmeleri ve ödeme kayıtları hazırlanmalıdır."] };
    case "hizmet-fuarcilik":
      return { matched: hs && f.serviceSector === "Fuarcilik", reasons: ["Fuarcılık hizmet ihracatı profili mevcut."], blockers: ["Fuarcılık hizmet ihracatı niteliği net değil."], actions: ["Etkinlik, katılımcı ve yurt dışı gelir belgeleri hazırlanmalıdır."] };
    case "hizmet-yaratici":
      return { matched: hs && f.serviceSector === "FilmDiziAnimasyon", reasons: ["Yaratıcı endüstri hizmet ihracatı sinyali mevcut."], blockers: ["Film/dizi/animasyon yaratıcı hizmet geliri net değil."], actions: ["Uluslararası yayın/satış sözleşmeleri ve gelir kayıtları hazırlanmalıdır."] };
    case "hizmet-reklam-tasarim":
      return { matched: hs && f.serviceSector === "ReklamPazarlamaTasarim", reasons: ["Reklam/pazarlama/tasarım hizmet ihracatı profili uygun."], blockers: ["Hizmet türü ve döviz geliri niteliği net değil."], actions: ["Yurt dışı müşteri sözleşmeleri ve kampanya çıktıları hazırlanmalıdır."] };
    case "hizmet-yurtdisi-birim":
      return { matched: hs && f.plansServiceForeignOffice, reasons: ["Hizmet ihracatı için yurt dışı birim/ofis planı mevcut."], blockers: ["Yurt dışı birim/ofis planı görünmüyor."], actions: ["Yurt dışı birim sözleşme ve kira/operasyon planı hazırlanmalıdır."] };
    case "hizmet-tanitim":
      return { matched: hs && f.runsServicePromotionAbroad, reasons: ["Hizmet ihracatı için yurt dışı tanıtım faaliyeti mevcut."], blockers: ["Yurt dışı tanıtım faaliyeti net değil."], actions: ["Tanıtım planı, kampanya raporları ve görsel kanıtlar hazırlanmalıdır."] };
    case "hizmet-belgelendirme":
      return { matched: hs && f.needsCertificationAccreditationLicense, reasons: ["Belgelendirme/akreditasyon/ruhsat ihtiyacı mevcut."], blockers: ["Belgelendirme ihtiyacı net değil."], actions: ["Belgelendirme planı ve kurum teklifleri hazırlanmalıdır."] };
    case "hizmet-rapor-danismanlik":
      return { matched: hs && f.needsMarketEntryReportOrConsultancy, reasons: ["Pazara giriş raporu/danışmanlık ihtiyacı mevcut."], blockers: ["Rapor/danışmanlık ihtiyacı net değil."], actions: ["Hedef pazar ve danışmanlık kapsamı dokümante edilmelidir."] };
    case "hizmet-etkinlik-heyet":
      return { matched: hs && f.joinsServiceEventsB2B, reasons: ["Etkinlik/fuar/B2B katılımı planlanıyor."], blockers: ["Etkinlik/B2B katılım planı görünmüyor."], actions: ["Etkinlik takvimi ve katılım belgeleri hazırlanmalıdır."] };
    default:
      return { matched: false, reasons: [], blockers: [notEligibleFlow], actions: ["Faaliyet yapısı destek mevzuatına göre yeniden kurgulanmalıdır."] };
  }
};

const evaluateStatus = (
  support: TicaretSupportDefinition,
  form: TicaretFormState,
  matched: boolean,
): TicaretSupportStatus => {
  if (!form.isTurkeyResident) return "UYGUN DEĞİL / RİSKLİ";

  if (support.supportClass === "MAL" && !hasAnyMalActivity(form)) return "UYGUN DEĞİL / RİSKLİ";
  if (support.supportClass === "EIHRACAT" && !hasAnyEihracatActivity(form)) return "UYGUN DEĞİL / RİSKLİ";
  if (support.supportClass === "HIZMET" && !hasAnyServiceActivity(form)) return "UYGUN DEĞİL / RİSKLİ";

  if (!matched) return "UYGUN DEĞİL / RİSKLİ";

  if (!form.notFundedByOtherPublicSupport) return "UYGUN DEĞİL / RİSKLİ";

  if (!hasDysInfra(form) || !hasBasicEvidence(form) || !isSpendingComplianceStrong(form)) return "POTANSİYEL";

  if (support.supportClass === "MAL" && !form.isExporterUnionMember) return "POTANSİYEL";

  if (support.requiresSpecialStatus) return "POTANSİYEL";

  return "UYGUN";
};

export const evaluateTicaretSupports = (
  form: TicaretFormState,
  selection: TicaretSupportSelection,
): TicaretSupportResult[] => {
  const classSet = selectedClassSet(selection);
  const projectSubjectAnalysis = getStoredProjectSubjectAnalysis();

  return ticaretSupports
    .filter((support) => classSet.has(support.supportClass))
    .map((support) => {
      const match = matchSupport(support, form);
      let status = evaluateStatus(support, form, match.matched);

      const whyEligible = match.matched ? [...match.reasons] : [];
      const whyNotEligible = !match.matched ? [...match.blockers] : [];
      const howToBecomeEligible = !match.matched ? [...match.actions] : [];

      if (projectSubjectCanPromoteTicaret(projectSubjectAnalysis, support)) {
        whyEligible.push("Proje konusu metni bu ihracat desteğiyle uyumlu anahtar kelimeler içeriyor.");

        if (status === "UYGUN DEĞİL / RİSKLİ" && form.isTurkeyResident && form.notFundedByOtherPublicSupport) {
          status = "POTANSİYEL";
          whyNotEligible.push("Konu uyumu olumlu olsa da ihracat, belge ve başvuru altyapısı ayrıca tamamlanmalıdır.");
          howToBecomeEligible.push("Konuya uygun pazar, faturalama, tahsilat ve başvuru belgelendirmesi güçlendirilmelidir.");
        }
      }

      if (!hasDysInfra(form) && status !== "UYGUN DEĞİL / RİSKLİ") {
        whyNotEligible.push("DYS/KEP/e-imza altyapısı eksik olduğundan kesin uygunluk verilemedi.");
        howToBecomeEligible.push("DYS kaydı, KEP adresi ve e-imza/mali mühür altyapısı tamamlanmalıdır.");
      }

      if (!form.hasInvoicesDecotsContractsAndProof || !form.paymentsFromCompanyBankAccount || !form.canDocumentCollectionsViaBank) {
        whyNotEligible.push("Fatura/dekont/sözleşme/banka kanıtı setinde eksik bulunuyor.");
        howToBecomeEligible.push("Harcama ve tahsilat belgeleri banka kanalıyla izlenebilir şekilde arşivlenmelidir.");
      }

      if (!form.notFundedByOtherPublicSupport) {
        whyNotEligible.push("Aynı giderin başka kamu desteğinden karşılandığı riski bulunduğundan uygunluk zayıf.");
        howToBecomeEligible.push("Mükerrer destek olmayacak şekilde gider eşleştirmesi ve beyan seti hazırlanmalıdır.");
      }

      if (support.supportClass === "MAL" && !form.isExporterUnionMember) {
        whyNotEligible.push("Mal ihracatı desteklerinde ihracatçı birliği üyeliği/işlem adımı kritik olabilir.");
        howToBecomeEligible.push("İhracatçı birliği üyeliği ve ilgili başvuru mercii koşulları tamamlanmalıdır.");
      }

      if (support.requiresSpecialStatus) {
        whyNotEligible.push("Bu destek türü statü/program tanımı veya iş birliği yapısı gerektirebilir.");
        howToBecomeEligible.push("Gerekli statü (UR-GE, konsorsiyum, program seviyesi vb.) güncel usule göre doğrulanmalıdır.");
      }

      const howToGet =
        status === "UYGUN"
          ? [...eligibleFlow]
          : status === "POTANSİYEL"
            ? [potentialFlow, ...eligibleFlow]
            : [];

      if (status === "UYGUN DEĞİL / RİSKLİ" && whyNotEligible.length === 0) {
        whyNotEligible.push(notEligibleFlow);
      }

      if (status === "UYGUN DEĞİL / RİSKLİ" && howToBecomeEligible.length === 0) {
        howToBecomeEligible.push("İhracat faaliyeti, harcama kurgusu ve belge seti mevzuata göre yeniden yapılandırılmalıdır.");
      }

      const riskNote = getGeneralRiskNotes(form).join(" ");

      const nextAction =
        status === "UYGUN"
          ? "Destek özelinde başvuru süresini netleştirip DYS/ihracatçı birliği kanalından başvuru dosyasını gönderin."
          : status === "POTANSİYEL"
            ? "Eksik altyapı ve belge adımlarını tamamlayıp destek başvurusunu güncel genelgeye göre kesinleştirin."
            : "Destek türüne uygun ihracat/harcama/belge yapısını kurgulayıp tekrar ön değerlendirme yapın.";

      return {
        id: support.id,
        supportName: support.supportName,
        supportClass: support.supportClass,
        status,
        institution: support.institution,
        legalBasis: support.legalBasis,
        applicantProfile: support.applicantProfile,
        supportedExpenses: support.supportedExpenses,
        estimatedStructure: support.estimatedStructure,
        whyEligible,
        howToGet,
        whyNotEligible,
        howToBecomeEligible,
        requiredDocuments: commonDocuments,
        applicationChannel: `${support.applicationChannel}. Güncel genelge ve uygulama usulü kontrol edilmeli.`,
        nextAction,
        riskNote,
      };
    });
};

export const summarizeTicaretResults = (
  results: TicaretSupportResult[],
  form: TicaretFormState,
): TicaretSummary => {
  const uygunCount = results.filter((item) => item.status === "UYGUN").length;
  const potansiyelCount = results.filter((item) => item.status === "POTANSİYEL").length;
  const riskliCount = results.filter((item) => item.status === "UYGUN DEĞİL / RİSKLİ").length;

  return {
    uygunCount,
    potansiyelCount,
    riskliCount,
    missingDocumentCount: computeMissingDocumentCount(form),
    dysReadiness: computeDysReadiness(form),
    exportSuitability: computeExportSuitabilityScore(form),
  };
};


