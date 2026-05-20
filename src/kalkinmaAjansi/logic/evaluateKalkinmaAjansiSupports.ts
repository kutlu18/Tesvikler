import { kalkinmaAjansiSupports } from "../data/kalkinmaAjansiSupports";
import {
  KalkinmaFormState,
  KalkinmaSummary,
  KalkinmaSupportDefinition,
  KalkinmaSupportResult,
  KalkinmaSupportStatus,
  NeedSelection,
  ScoreInfo,
} from "../types";
const sourceWarningText =
  "Kalkinma Ajansi desteklerinde programlar, butceler, uygun basvuru sahipleri, destek oranlari, son basvuru tarihleri ve uygun giderler ajans bazinda degisir. Guncel bilgi ilgili Kalkinma Ajansi resmi sitesi ve KAYS ilanlarindan kontrol edilmelidir.";

const finalSuitabilityWarning =
  "Nihai uygunluk ilgili Kalkinma Ajansi'nin acik programi, basvuru rehberi, KAYS basvurusu ve ajans degerlendirmesiyle dogrulanmalidir.";

const commonHowToGet = [
  "Ilgili ajansin acik program rehberi, son basvuru tarihi ve uygun basvuru sahibi kosullari kontrol edilir.",
  "KAYS kaydi uzerinden basvuru sahibi bilgileri, proje formu, butce, faaliyet plani ve ek belgeler hazirlanir.",
  "Taahhutname, imza/yetki sureci ve programa ozel teslim adimlari rehbere uygun tamamlanir.",
  "Ajans on inceleme, teknik degerlendirme ve kurul surecine gore nihai karar verir.",
];

const potentialText =
  "Proje destek programina uygun gorunuyor ancak acik cagri, basvuru sahibi uygunlugu, bolge plani oncelikleri, es finansman, butce limitleri, KAYS kaydi veya belge seti dogrulanmadan kesin uygunluk verilemez.";

const riskText =
  "Destek su an uygun gorunmuyor cunku proje ilgili ajans bolgesinde degil, basvuru sahibi tipi uygun degil, acik program bulunmuyor, proje bolge oncelikleriyle uyumlu degil veya giderler destek kapsaminda degil.";

const commonRequiredDocuments = [
  "KAYS kullanici kaydi",
  "Basvuru formu",
  "Proje butcesi",
  "Faaliyet plani",
  "Mantiksal cerceve",
  "Performans gostergeleri",
  "Proforma faturalar",
  "Teknik sartnameler",
  "Es finansman belgeleri",
  "Yetki belgesi",
  "Imza sirkuleri",
  "Ticaret sicil gazetesi",
  "Vergi levhasi",
  "Faaliyet belgesi",
  "Mali tablolar",
  "Oda/borsa/kooperatif/STK kayit belgeleri",
  "Ortaklik/istirakci beyanlari",
  "Taahhutname",
  "Fizibilite/on etut belgeleri",
  "Tapu/kira/yer tahsis belgeleri (gerekiyorsa)",
  "CED/ruhsat/izin belgeleri (gerekiyorsa)",
  "Sosyal etki veya istihdam plani",
  "Surdurulebilirlik plani",
  "Satin alma plani",
  "Gorunurluk plani",
];

interface MatchResult {
  matched: boolean;
  relevant: boolean;
  positive: string[];
  negative: string[];
  actions: string[];
  callCheckRequired: boolean;
}

const hasApplicantTypeCompatibility = (f: KalkinmaFormState): boolean => {
  if (f.applicantType === "DIGER") return false;
  if (f.applicantType === "KOBI_OZEL_SEKTOR") return f.isKobi || f.isManufacturer || f.isServiceSector;
  return true;
};

const hasCoreProjectDefinition = (f: KalkinmaFormState): boolean =>
  Boolean(f.projectCity.trim()) && Boolean(f.projectSubject.trim()) && f.projectDurationMonths > 0;

const hasCoreDocuments = (f: KalkinmaFormState): boolean =>
  f.hasApplicationFormDraft && f.hasProjectBudgetDraft && f.hasProformaInvoices && f.hasTechnicalSpecifications;

const hasKaysCore = (f: KalkinmaFormState): boolean =>
  f.hasKaysUserAccount && f.kaysAuthorizedSignatoryReady && f.reviewedOpenCallGuideline;

const hasImpactSignal = (f: KalkinmaFormState): boolean =>
  f.hasLocalDevelopmentImpact ||
  f.isDigitalTransformation ||
  f.isGreenTransformation ||
  f.isSocialImpactProject ||
  f.linkedToLocalProductTheme;

const isSupportRelevant = (supportId: string, selection: NeedSelection): boolean => {
  switch (supportId) {
    case "mali-destek-programi":
      return selection.maliDestek;
    case "teknik-destek-programi":
      return selection.teknikDestek;
    case "fizibilite-destegi":
      return selection.fizibilite;
    case "faizsiz-kredi-destegi":
      return selection.faizsizKredi;
    case "faiz-kar-payi-destegi":
      return selection.faizKarPayi;
    case "gudumlu-proje-destegi":
      return selection.gudumluProje;
    case "sogep-baglantili-projeler":
      return selection.sosyalGelisme;
    case "yerel-urun-kalkinma-destekleri":
      return selection.yerelUrun;
    case "dijital-donusum-destekleri":
      return selection.dijitalDonusum;
    case "yesil-donusum-destekleri":
      return selection.yesilDonusum;
    case "turizm-kultur-yaratici-endustri-destekleri":
      return selection.yerelUrun || selection.maliDestek;
    case "afet-dayaniklilik-destekleri":
      return selection.sosyalGelisme || selection.maliDestek;
    default:
      return true;
  }
};

const calculateKalkinmaAjansiUygunlukScore = (f: KalkinmaFormState): ScoreInfo => {
  let score = 0;

  if (Boolean(f.projectCity.trim()) && f.agencyRegionKnown) score += 10;
  if (Boolean(f.projectSubject.trim())) score += 10;
  if (hasApplicantTypeCompatibility(f) && f.isTurkeyResident) score += 15;
  if (f.fitsRegionalPlanPriorities || f.fitsCityPrioritySectors) score += 15;
  if (f.reviewedOpenCallGuideline || f.hasOpenFinancialCall) score += 15;
  if (f.canProvideCoFinance || f.coFinanceBudgetAllocated || f.hasCoFinanceDeclaration) score += 10;
  if (f.hasProjectBudgetDraft && f.hasProjectTimeline) score += 10;
  if (f.hasProformaInvoices && f.hasTechnicalSpecifications && hasCoreDocuments(f)) score += 10;
  if (hasImpactSignal(f)) score += 5;

  if (score <= 39) return { score, comment: "0-39: Kalkinma Ajansi destegi icin zayif / ciddi eksik var" };
  if (score <= 69) return { score, comment: "40-69: Potansiyel, cagri ve proje dosyasi guclendirilmeli" };
  return { score, comment: "70-100: Guclu Kalkinma Ajansi destek adayi" };
};

const calculateKaysReadinessScore = (f: KalkinmaFormState): ScoreInfo => {
  let score = 0;

  if (f.hasKaysUserAccount) score += 20;
  if (f.kaysAuthorizedSignatoryReady && f.hasSignatureAuthorityDocs) score += 15;
  if (f.hasApplicationFormDraft) score += 15;
  if (f.hasProjectBudgetDraft) score += 15;
  if (f.hasProformaInvoices && f.hasTechnicalSpecifications) score += 10;
  if (f.hasCoFinanceDeclaration) score += 10;
  if (f.hasPartnerAffiliateDocs) score += 5;
  if (f.reviewedOpenCallGuideline) score += 10;

  if (score <= 39) return { score, comment: "0-39: KAYS basvuru altyapisi hazir degil" };
  if (score <= 69) return { score, comment: "40-69: Eksik basvuru altyapisi tamamlanmali" };
  return { score, comment: "70-100: Basvuru hazirligi guclu" };
};

const calculateMissingDocumentCount = (f: KalkinmaFormState): number => {
  const checks = [
    f.hasKaysUserAccount,
    f.kaysAuthorizedSignatoryReady,
    f.hasSignatureAuthorityDocs,
    f.hasTaxCertificate,
    f.hasTradeRegistryGazette,
    f.hasActivityCertificate,
    f.hasFinancialStatements,
    f.hasApplicationFormDraft,
    f.hasProjectBudgetDraft,
    f.hasProformaInvoices,
    f.hasTechnicalSpecifications,
    f.hasPartnerAffiliateDocs,
    f.hasCommitmentLetters,
    f.hasCoFinanceDeclaration,
    f.hasProjectTimeline,
    f.reviewedOpenCallGuideline,
  ];

  return checks.filter((item) => !item).length;
};

const productSpecificDocs = (supportId: string): string[] => {
  switch (supportId) {
    case "teknik-destek-programi":
      return ["Egitim/danismanlik ihtiyac notu", "Beklenen teknik cikti listesi"];
    case "fizibilite-destegi":
      return ["Fizibilite kapsam dokumani", "Hizmet alimi plani", "Rapor teslim takvimi"];
    case "faizsiz-kredi-destegi":
    case "faiz-kar-payi-destegi":
      return ["Kredi geri odeme plani", "Teminat altyapi dokumani", "Araci finans kurumu on gorusmesi"];
    case "gudumlu-proje-destegi":
      return ["Ortaklik protokolu", "Yonetisim modeli", "Stratejik etki analizi"];
    case "yesil-donusum-destekleri":
      return ["Enerji etudu", "Karbon/surdurulebilirlik teknik raporu", "Yesil donusum yatirim plani"];
    default:
      return [];
  }
};

const matchSupport = (support: KalkinmaSupportDefinition, f: KalkinmaFormState, selection: NeedSelection): MatchResult => {
  switch (support.id) {
    case "mali-destek-programi": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        f.hasOpenFinancialCall &&
        f.fitsProgramPriorities &&
        f.budgetWithinCallLimits &&
        (f.callOpenToPrivateSector || f.callOpenToNonProfitPublic) &&
        f.coFinanceRateMet;
      return {
        matched,
        relevant,
        positive: [
          "Acik mali destek cagrisi ve program oncelikleri ile uyum sinyali mevcut.",
          "Butce limitleri ve es finansman karsilanabiliyor gorunuyor.",
        ],
        negative: [
          "Acik cagrinin durumu, butce limitleri veya es finansman kosullari net degil.",
          "Program basvuru sahibi kosullari rehbere gore dogrulanmali.",
        ],
        actions: [
          "Ajansin acik mali destek rehberi satir satir kontrol edilmelidir.",
          "KAYS basvurusu icin butce, proforma, teknik sartname ve taahhut seti tamamlanmalidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "teknik-destek-programi": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        f.technicalNeedIsCapacityBuilding &&
        f.applicantEligibleForTechnicalSupport &&
        f.technicalSupportNotCashMachinery &&
        f.technicalNeedAreaRelevant &&
        f.technicalOutputDefined;
      return {
        matched,
        relevant,
        positive: [
          "Ihtiyac teknik destek kapsaminda egitim/danismanlik/uzmanlik niteliginde.",
          "Makine-ekipman yerine kapasite gelistirme ciktisi net tanimlanmis.",
        ],
        negative: [
          "Teknik destek nakit/makine alimi icin kullanilamaz.",
          "Teknik cikti ve ekip tanimi net olmadiginda uygunluk zayiflar.",
        ],
        actions: [
          "Egitim/danismanlik kapsam notu ve olculebilir cikti listesi hazirlanmalidir.",
          "Basvuru sahibi uygunlugu ve donemsel teknik destek takvimi kontrol edilmelidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "fizibilite-destegi": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        f.feasibilityBeforeInvestmentDecision &&
        f.feasibilityHasRegionalImpact &&
        f.feasibilityCanLeadToInvestmentDecision &&
        f.feasibilityApplicantEligible;
      return {
        matched,
        relevant,
        positive: [
          "Yatirim karari oncesi fizibilite ihtiyaci net.",
          "Bolgesel etki ve karar surecine katkisi tanimlanmis.",
        ],
        negative: [
          "Fizibilite raporu cikti formati/sure plani net degil.",
          "Basvuru sahibi uygunlugu dogrulanmadan kesin uygunluk verilemez.",
        ],
        actions: [
          "Fizibilite kapsam, hizmet alimi plani ve rapor takvimi olusturulmalidir.",
          "Raporun sure icinde teslim edilmemesi halinde iptal/geri alma riski not edilmelidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "faizsiz-kredi-destegi": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        f.financeProjectIsPrivateInvestment &&
        f.financeNeedExists &&
        f.financeFitsAgencyPriorities &&
        f.financeViaIntermediaryPossible &&
        f.financeRepaymentCapacity &&
        f.financeCollateralSuitable;
      return {
        matched,
        relevant,
        positive: [
          "Proje geri odemeli finansman yapisina uygun gorunuyor.",
          "Araci finans kurumu, geri odeme ve teminat yapisi tanimlanmis.",
        ],
        negative: [
          "Bu destek hibe degildir; kredi geri odeme kapasitesi zorunludur.",
          "Teminat/geri odeme yapisi net degilse riskli gorunur.",
        ],
        actions: [
          "Kredi vadesi, geri odeme plani ve teminat dokumani netlestirilmelidir.",
          "Ajans-protokol banka sureci urun bazinda teyit edilmelidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "faiz-kar-payi-destegi": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        f.hasOpenFinancialCall &&
        f.financeNeedExists &&
        f.financeViaIntermediaryPossible &&
        f.financeRepaymentCapacity &&
        f.financeFitsAgencyPriorities;
      return {
        matched,
        relevant,
        positive: [
          "Banka kredisi kullanimina bagli faiz/kar payi destegi potansiyeli var.",
          "Proje ajans oncelikleriyle iliski kuruyor.",
        ],
        negative: [
          "Acik faiz/kar payi programi olmadan kesin uygunluk verilemez.",
          "Banka kredi uygunlugu olmadan destek calismaz.",
        ],
        actions: [
          "Acik program rehberi ve oran/ust limitler kontrol edilmelidir.",
          "Banka kredi on gorusmesi ve mali uygunluk dosyasi tamamlanmalidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "gudumlu-proje-destegi": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        f.guidedProjectWithStrategicActors &&
        f.guidedProjectHighRegionalImpact &&
        f.guidedProjectCreatesEcosystemImpact &&
        f.guidedProjectBeyondSingleCompany &&
        f.guidedProjectGovernanceReady;
      return {
        matched,
        relevant,
        positive: [
          "Proje bolgesel etki ve ekosistem olceginde stratejik nitelik tasiyor.",
          "Kurumlar arasi ortaklik ve yonetisim modeli hazirlik sinyali var.",
        ],
        negative: [
          "Bireysel firma odakli standart yatirimlar gudumlu proje icin zayif kalir.",
          "Ajansla on istisare olmadan uygunluk netlesmez.",
        ],
        actions: [
          "Ajans ile on gorusme yapilip stratejik uyum teyit edilmelidir.",
          "Ortaklik protokolu ve yonetisim modeli yazili hale getirilmelidir.",
        ],
        callCheckRequired: false,
      };
    }
    case "sogep-baglantili-projeler": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        f.isSocialImpactProject &&
        (f.applicantType === "KOOPERATIF" ||
          f.applicantType === "BELEDIYE_KAMU" ||
          f.applicantType === "STK_DERNEK_VAKIF" ||
          f.applicantType === "YEREL_YONETIM_ISTIRAKI") &&
        f.hasLocalDevelopmentImpact;
      return {
        matched,
        relevant,
        positive: [
          "Sosyal etki, istihdam ve dezavantajli grup odagi bu program mantigina uyuyor.",
          "Basvuru sahibi tipi sosyal gelisme temalarina daha yakin gorunuyor.",
        ],
        negative: [
          "SOGEP benzeri programlarda basvuru sahibi tipi ve acik cagri kosullari kritiktir.",
          "Sosyal etki modelinin olculebilir olmamasi uygunlugu zayiflatir.",
        ],
        actions: [
          "Sosyal etki/istihdam plani sayisal hedeflerle guclendirilmelidir.",
          "Acik program ve uygun basvuru sahibi kosullari rehberden dogrulanmalidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "yerel-urun-kalkinma-destekleri": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        (f.linkedToLocalProductTheme || f.isLocalProductRuralProject) &&
        (f.hasLocalDevelopmentImpact || f.fitsRegionalPlanPriorities);
      return {
        matched,
        relevant,
        positive: [
          "Yerel urun/kirsal kalkinma ve ticarilestirme baglantisi mevcut.",
          "Bolgesel deger zinciri ve rekabet etkisi olusturma potansiyeli var.",
        ],
        negative: [
          "Yillik tema ve ajans bolge plani oncelikleri dogrulanmadan kesin uygunluk verilemez.",
          "Markalasma ve pazar plani eksikse dosya zayif kalir.",
        ],
        actions: [
          "Urun ticarilestirme, markalasma, satis kanali ve pazarlama kurgusu netlestirilmelidir.",
          "Ajans tematik cagrilari ve rehberleri kontrol edilmelidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "turizm-kultur-yaratici-endustri-destekleri": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched = f.isTourismCreativeProject && (f.hasLocalDevelopmentImpact || f.fitsCityPrioritySectors);
      return {
        matched,
        relevant,
        positive: [
          "Turizm/kultur/yaratici endustri odakli proje tanimi mevcut.",
          "Yerel rekabet veya destinasyon etkisi olusuyor.",
        ],
        negative: [
          "Standart ticari reklam kampanyasi niteligindeki projeler riskli olabilir.",
          "Basvuru sahibi tipi ve acik cagri kosullari kontrol edilmelidir.",
        ],
        actions: [
          "Projenin bolgesel turizm etkisi ve olculebilir ciktilari netlestirilmelidir.",
          "Acik turizm/kultur cagrisi ve rehber kosullari kontrol edilmelidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "dijital-donusum-destekleri": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        (f.isDigitalTransformation || f.hasSoftwareDigitalExpense) &&
        (f.hasProjectOutputsAndIndicators || f.technicalNeedAreaRelevant);
      return {
        matched,
        relevant,
        positive: [
          "Dijital donusum/verimlilik ihtiyaci proje konusu ile uyumlu.",
          "Yazilim/dijital altyapi giderleri ve olculebilir cikti tanimi mevcut.",
        ],
        negative: [
          "Acik mali/teknik destek cagrisi dogrulanmadan kesin uygunluk verilemez.",
          "Ayni giderin baska kamu destegiyle kesisimi cifte finansman riski olusturur.",
        ],
        actions: [
          "Dijital proje kapsami ve KPI listesi netlestirilmelidir.",
          "KOSGEB/TUBITAK diger desteklerle gider cakismasi kontrol edilmelidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "yesil-donusum-destekleri": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched =
        (f.isGreenTransformation || f.hasEnergyEfficiencyOrGesExpense) &&
        (f.hasFeasibilityReportExpense || f.hasTechnicalSpecifications) &&
        hasImpactSignal(f);
      return {
        matched,
        relevant,
        positive: [
          "Yesil donusum/enerji verimliligi temasi proje ihtiyaciyla uyumlu.",
          "Teknik rapor veya uygulama altyapisi sinyali mevcut.",
        ],
        negative: [
          "Teknik rapor/fizibilite ve harcama kurgusu eksikse uygunluk potansiyelde kalir.",
          "Diger kamu destekleriyle cifte finansman riski kontrol edilmelidir.",
        ],
        actions: [
          "Enerji etudu/surdurulebilirlik raporu ve yesil donusum yol haritasi hazirlanmalidir.",
          "Cifte finansman riski icin gider bazli eslestirme tablosu olusturulmalidir.",
        ],
        callCheckRequired: true,
      };
    }
    case "afet-dayaniklilik-destekleri": {
      const relevant = isSupportRelevant(support.id, selection);
      const matched = f.linkedToSpecialArea && f.hasLocalDevelopmentImpact && (f.isNewInvestment || f.hasProjectManagementCapacity);
      return {
        matched,
        relevant,
        positive: [
          "Afet dayanikliligi/deprem bolgesiyle iliskili proje sinyali mevcut.",
          "Sosyal-ekonomik toparlanma veya uretim surekliligi etkisi olusuyor.",
        ],
        negative: [
          "Acik afet temali program ve il bolge uygunlugu dogrulanmadan kesin uygunluk verilemez.",
          "Bolgesel etki veya uygulama kapasitesi zayifsa risk artar.",
        ],
        actions: [
          "Ilgili il/bolge icin acik afet odakli programlar kontrol edilmelidir.",
          "Proje uygulama takvimi ve risk azaltim plani netlestirilmelidir.",
        ],
        callCheckRequired: true,
      };
    }
    default:
      return {
        matched: false,
        relevant: true,
        positive: [],
        negative: [riskText],
        actions: ["Program rehberiyle uyumlu sekilde proje yeniden kurgulanmalidir."],
        callCheckRequired: true,
      };
  }
};

const resolveStatus = (support: KalkinmaSupportDefinition, f: KalkinmaFormState, match: MatchResult): KalkinmaSupportStatus => {
  if (!f.isTurkeyResident) return "UYGUN DEGIL / RISKLI";
  if (!hasApplicantTypeCompatibility(f)) return "UYGUN DEGIL / RISKLI";

  if (!match.relevant) return "POTANSIYEL";

  if (!hasCoreProjectDefinition(f)) return "POTANSIYEL";
  if (!f.agencyRegionKnown || !f.projectInAgencyRegion) return "POTANSIYEL";

  if (!match.matched) return "UYGUN DEGIL / RISKLI";

  if (!f.fitsRegionalPlanPriorities || !f.fitsCityPrioritySectors) return "POTANSIYEL";
  if (!f.canProvideCoFinance && support.supportClass === "MALI_DESTEK") return "POTANSIYEL";
  if (!hasKaysCore(f) || !hasCoreDocuments(f)) return "POTANSIYEL";

  if (match.callCheckRequired && !f.reviewedOpenCallGuideline) return "POTANSIYEL";

  return "UYGUN";
};

const riskNotes = (support: KalkinmaSupportDefinition, f: KalkinmaFormState): string[] => {
  const notes = [sourceWarningText, finalSuitabilityWarning];

  if (f.hasTaxOrSgkDebt) notes.push("Vergi/SGK borcu basvuru degerlendirmesinde risk notu olusturabilir.");
  if (f.hadProjectCancellationOrIrregularity) notes.push("Gecmis proje iptali/usulsuzluk kaydi surec riskini artirabilir.");
  if (f.expensesBeforeApproval) notes.push("Sozlesme/onay oncesi harcama yapilmis olmasi uygun gider riskini artirir.");
  if (f.financedByOtherPublicSupport) notes.push("Ayni giderde cifte finansman riski kontrol edilmelidir.");
  if (support.supportClass === "TEKNIK_DESTEK") notes.push("Teknik destekte makine-ekipman degil, egitim/danismanlik/uzmanlik ciktisi esastir.");
  if (support.supportClass === "FAIZSIZ_KREDI" || support.supportClass === "FAIZ_KAR_PAYI") {
    notes.push("Bu arac hibe degil; geri odemeli kredi veya finansman maliyeti destegi niteligindedir.");
  }

  return notes;
};

export const evaluateKalkinmaAjansiSupports = (
  form: KalkinmaFormState,
  selection: NeedSelection,
): KalkinmaSupportResult[] => {
  const relevantSupports = kalkinmaAjansiSupports.filter((support) => isSupportRelevant(support.id, selection));

  return relevantSupports.map((support) => {
    const match = matchSupport(support, form, selection);
    const status = resolveStatus(support, form, match);

    const whyEligible = status !== "UYGUN DEGIL / RISKLI" && match.matched ? [...match.positive] : [];
    const whyNotEligible = status === "UYGUN DEGIL / RISKLI" ? [...match.negative] : [];
    const howToBecomeEligible = status === "UYGUN DEGIL / RISKLI" ? [...match.actions] : [];

    if (!match.relevant) {
      whyNotEligible.push("Secilen destek ihtiyaci tiplerinde bu program birincil oncelikte degil.");
      howToBecomeEligible.push("Ihtiyac tipi seciminde ilgili basligi aktif ederek program tekrar degerlendirilmelidir.");
    }

    if (!form.agencyRegionKnown || !form.projectInAgencyRegion) {
      whyNotEligible.push("Proje ili ve ilgili kalkinma ajansi bolgesi kesinlesmeden kesin uygunluk verilemez.");
      howToBecomeEligible.push("Proje uygulama ili, ajans bolgesi ve bolge plani onceligi netlestirilmelidir.");
    }

    if (match.callCheckRequired && !form.reviewedOpenCallGuideline) {
      whyNotEligible.push("Acik cagri rehberi ve son basvuru takvimi kontrol edilmedigi icin kesin uygunluk verilemedi.");
      howToBecomeEligible.push("Ilgili program rehberi KAYS ilanlariyla birlikte kontrol edilmelidir.");
    }

    if (status === "POTANSIYEL" && !hasCoreDocuments(form)) {
      whyNotEligible.push("Basvuru dosyasinda butce/proforma/teknik sartname eksigi bulunuyor.");
      howToBecomeEligible.push("Basvuru formu, butce, proforma ve teknik sartname seti tamamlanmalidir.");
    }

    if (!hasApplicantTypeCompatibility(form)) {
      whyNotEligible.push("Basvuru sahibi tipi bu program gruplarinda zayif gorunuyor.");
      howToBecomeEligible.push("Program rehberindeki uygun basvuru sahibi tipine gore basvuru modeli kurgulanmalidir.");
    }

    if (status === "UYGUN DEGIL / RISKLI" && whyNotEligible.length === 0) {
      whyNotEligible.push(riskText);
    }

    const howToGet =
      status === "UYGUN"
        ? [
            "Proje ve basvuru sahibi on uygunluk kriterlerini sagliyor.",
            "Ilgili kalkinma ajansinin acik program rehberi kontrol edilir.",
            "KAYS kaydi yapilir; basvuru formu, butce, faaliyet plani, proforma, teknik sartname ve es finansman belgeleri hazirlanir.",
            "Basvuru KAYS uzerinden tamamlanir; taahhutname ve imza sureci rehbere gore yurutulur.",
            "Nihai karar ajans degerlendirme sureci sonunda kesinlesir.",
          ]
        : status === "POTANSIYEL"
          ? [potentialText, ...commonHowToGet]
          : [];

    const nextAction =
      status === "UYGUN"
        ? "KAYS basvuru dosyasini tamamlayip ilgili ajans takvimine gore resmi basvuruyu baslatin."
        : status === "POTANSIYEL"
          ? "Acik cagri rehberi, basvuru sahibi uygunlugu ve eksik belge setini tamamlayip analizi yenileyin."
          : "Proje konusu, basvuru sahibi tipi, bolge uygunlugu ve gider yapisini ajans rehberine gore yeniden kurgulayin.";

    const requiredDocuments = Array.from(new Set([...productSpecificDocs(support.id), ...commonRequiredDocuments]));

    return {
      id: support.id,
      supportName: support.supportName,
      status,
      institution: support.institution,
      supportClass: support.supportClass,
      applicantProfile: support.applicantProfile,
      suitableProjectType: support.suitableProjectType,
      supportedExpenses: support.supportedExpenses,
      estimatedSupportStructure: support.estimatedSupportStructure,
      whyEligible,
      howToGet,
      whyNotEligible,
      howToBecomeEligible,
      requiredDocuments,
      applicationChannel: support.applicationChannel,
      nextAction,
      riskNote: riskNotes(support, form).join(" "),
      sourceWarning: sourceWarningText,
      callCheckRequired: match.callCheckRequired,
    };
  });
};

export const summarizeKalkinmaAjansiResults = (
  results: KalkinmaSupportResult[],
  form: KalkinmaFormState,
): KalkinmaSummary => {
  const uygunCount = results.filter((item) => item.status === "UYGUN").length;
  const potansiyelCount = results.filter((item) => item.status === "POTANSIYEL").length;
  const riskliCount = results.filter((item) => item.status === "UYGUN DEGIL / RISKLI").length;
  const callCheckCount = results.filter((item) => item.callCheckRequired).length;

  return {
    uygunCount,
    potansiyelCount,
    riskliCount,
    callCheckCount,
    missingDocumentCount: calculateMissingDocumentCount(form),
    kaysReadinessScore: calculateKaysReadinessScore(form),
    kalkinmaAjansiUygunlukScore: calculateKalkinmaAjansiUygunlukScore(form),
  };
};


