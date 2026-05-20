import { eximbankSupports } from "../data/eximbankSupports";
import {
  ProjectSubjectAnalysis,
  getStoredProjectSubjectAnalysis,
  hasProjectSubjectCategory,
} from "../../core/analysis/projectSubjectAnalysis";
import {
  EximbankFormState,
  EximbankNeedSelection,
  EximbankProductClass,
  EximbankScoreInfo,
  EximbankSummary,
  EximbankSupportDefinition,
  EximbankSupportResult,
  EximbankSupportStatus,
} from "../types";

const sourceWarningText =
  "Turk Eximbank urunlerinde vade, oran, limit, teminat ve basvuru kanali donemsel olarak degisebilir. Guncel bilgi Turk Eximbank, IGE ve ilgili araci banka resmi kaynaklarindan kontrol edilmelidir.";

const finalSuitabilityWarning =
  "Nihai uygunluk Turk Eximbank, IGE, araci banka ve kredi/sigorta degerlendirme surecleriyle dogrulanmalidir.";

const notGrantWarning =
  "Bu modulde gosterilen araclar hibe degil; agirlikli olarak geri odemeli kredi, kefalet, garanti veya sigorta urunleridir.";

const commonHowToGet = [
  "Turk Eximbank urun uygunlugu icin firma ve ihracat profiliyle on gorusme yapilir.",
  "Mali tablolar, mizan, ihracat belgeleri, siparis/sozlesme ve urune ozel evrak seti hazirlanir.",
  "Urune gore Eximbank, araci banka veya IGE kanalinda basvuru tamamlanir.",
  "Limit, vade, oran, teminat ve risk degerlendirmesi kurum surecinde netlesir.",
];

const potentialText =
  "Firma veya ihtiyac finansman urunune uygun gorunuyor ancak ihracat taahhudu, mali tablolar, teminat yapisi, alici bilgileri, harcama belgeleri, Eximbank limiti veya banka degerlendirmesi dogrulanmadan kesin uygunluk verilemez.";

const riskText =
  "Bu urun su an uygun gorunmuyor cunku firma ihracatci/doviz kazandirici hizmet firmasi niteliginde degil, ihracat taahhudu verilemiyor, finansman ihtiyaci urunun amacina uymuyor veya gerekli belge seti bulunmuyor.";

const commonRequiredDocuments = [
  "Vergi levhasi",
  "Ticaret sicil gazetesi",
  "Imza sirkuleri",
  "Faaliyet belgesi",
  "Ihracatci birligi uyeligi",
  "Son 2-3 yil mali tablolar",
  "Guncel mizan",
  "Kurumlar vergisi beyannamesi",
  "SGK/vergi borc durumu",
  "Ihracat beyannameleri",
  "Ihracat faturalari",
  "Yurt disi satis sozlesmeleri",
  "Purchase order / siparis formlari",
  "Proforma faturalar",
  "Ihracat taahhudu belgeleri",
  "Hammadde/ara mali/nihai urun faturalari",
  "Elektrik, su, dogal gaz, personel gider belgeleri",
  "Yatirim harcama listesi",
  "Makine-ekipman proformalari",
  "Yatirim Tesvik Belgesi ve faiz destegi bilgisi (varsa)",
  "Kredi talep formu",
  "Alici listesi ve alacak yaslandirma raporu",
  "Vadeli satis bilgileri",
  "Ulke ve alici risk bilgileri",
  "Teminat belgeleri",
  "IGE/KOSGEB/e-imza/mobil imza hazirlik belgeleri",
  "Surdurulebilirlik/yesil donusum teknik raporlari (varsa)",
];

const hasExporterProfile = (f: EximbankFormState): boolean =>
  f.isExporter || f.isManufacturerExporter || f.isExportOrientedManufacturer || f.hasForeignCurrencyService;

const hasStrongExportSignal = (f: EximbankFormState): boolean =>
  f.exportedLast12Months || f.hasExportOrderOrContract || f.hasProformaOrPurchaseOrder;

const hasCoreFinancialDocs = (f: EximbankFormState): boolean =>
  f.hasCurrentFinancialStatements && f.hasCurrentTrialBalance && f.hasLast2to3YearFinancials;

const hasCoreExportDocs = (f: EximbankFormState): boolean =>
  f.hasExportDeclarationsReady && f.hasSalesContractsAndOrders && f.hasProformaOrPurchaseOrder;

const hasNeedDefinition = (selection: EximbankNeedSelection): boolean =>
  Object.values(selection).some((value) => value);

const hasCreditOrFinanceNeed = (selection: EximbankNeedSelection): boolean =>
  selection.sevkOncesiFinansman ||
  selection.ihracataHazirlik ||
  selection.isletmeSermayesi ||
  selection.yatirimFinansmani ||
  selection.yesilFinansman ||
  selection.hizmetIhracatiFinansmani;

const hasInsuranceSignal = (f: EximbankFormState): boolean =>
  f.hasDeferredSales ||
  f.hasOpenAccountSales ||
  f.wantsCollectionRiskInsurance ||
  f.hasPoliticalCommercialCollectionRisk ||
  f.plansNewCountryOrBuyerSales;

const hasGreenSignal = (f: EximbankFormState): boolean =>
  f.hasCbamRisk ||
  f.hasEnergyEfficiencyInvestment ||
  f.hasGreenTransformationProject ||
  f.hasRenewableEnergyInvestment ||
  f.hasSustainabilityRoadmap;

const hasDocumentGaps = (f: EximbankFormState): boolean =>
  !f.hasCurrentFinancialStatements ||
  !f.hasCurrentTrialBalance ||
  !f.hasSalesContractsAndOrders ||
  !f.hasInvoicesAndPaymentRecords ||
  !f.knowsApplicationChannel;

const isNeedSelected = (selection: EximbankNeedSelection, need: keyof EximbankNeedSelection): boolean => selection[need];

const calculateExportFinanceSuitabilityScore = (f: EximbankFormState, selection: EximbankNeedSelection): EximbankScoreInfo => {
  let score = 0;

  if (f.isTurkeyResident) score += 10;
  if (hasExporterProfile(f)) score += 15;
  if (f.exportedLast12Months || f.hasExportOrderOrContract) score += 15;
  if (f.canProvideExportCommitment) score += 10;
  if (f.hasCurrentFinancialStatements && f.hasCurrentTrialBalance) score += 10;
  if (f.hasExportDeclarationsReady || f.hasSalesContractsAndOrders || f.hasProformaOrPurchaseOrder) score += 10;
  if (hasNeedDefinition(selection)) score += 10;
  if (f.hasCollateralDocuments || f.wantsIgeGuarantee || f.needsGuaranteeOrCollateralLetter) score += 10;
  if ((f.hasDeferredSales && f.hasReceivableAgingReport) || (f.hasExportOrientedInvestment && f.hasInvestmentExpenseDocuments)) score += 10;

  if (score <= 39) return { score, comment: "0-39: Eximbank/finansman basvurusu icin zayif / ciddi eksik var" };
  if (score <= 69) return { score, comment: "40-69: Potansiyel, belge ve finansal hazirlik guclendirilmeli" };
  return { score, comment: "70-100: Guclu ihracat finansmani adayi" };
};

const calculateFinanceReadinessScore = (f: EximbankFormState): EximbankScoreInfo => {
  let score = 0;

  if (f.hasCurrentFinancialStatements) score += 15;
  if (f.hasCurrentTrialBalance) score += 10;
  if (f.hasExportDeclarationsReady) score += 15;
  if (f.hasSalesContractsAndOrders || f.hasProformaOrPurchaseOrder) score += 10;
  if (f.hasExpenseDocuments) score += 10;
  if (f.hasBuyerListAndAging && f.hasForeignBuyerInformation) score += 10;
  if (f.hasCollateralDocuments || f.wantsIgeGuarantee || f.needsGuaranteeOrCollateralLetter) score += 10;
  if (f.isExporterUnionMember) score += 10;
  if (f.knowsApplicationChannel) score += 10;

  if (score <= 39) return { score, comment: "0-39: Finansman basvuru altyapisi hazir degil" };
  if (score <= 69) return { score, comment: "40-69: Eksik belge ve finansal hazirlik tamamlanmali" };
  return { score, comment: "70-100: Basvuru hazirligi guclu" };
};

const calculateMissingDocumentCount = (f: EximbankFormState): number => {
  const checks = [
    f.hasTaxCertificate,
    f.hasTradeRegistryGazette,
    f.hasSignatureCircular,
    f.hasActivityCertificate,
    f.hasCurrentTrialBalance,
    f.hasLast2to3YearFinancials,
    f.hasCorporateTaxReturns,
    f.hasExportDeclarationsReady,
    f.hasSalesContractsAndOrders,
    f.hasInvoicesAndPaymentRecords,
    f.canPrepareExportCommitmentDocuments,
    f.hasExpenseDocuments,
    f.canPrepareCreditRequestForm,
    f.hasBuyerListAndAging,
    f.hasForeignBuyerInformation,
    f.hasCollateralDocuments,
    f.hasIgeKosgebEimzaDocuments,
    f.knowsApplicationChannel,
  ];

  return checks.filter((item) => !item).length;
};

interface MatchResult {
  matched: boolean;
  relevant: boolean;
  positive: string[];
  negative: string[];
  actions: string[];
}

const projectSubjectCanPromoteEximbank = (
  analysis: ProjectSubjectAnalysis,
  supportId: string,
): boolean => {
  switch (supportId) {
    case "doviz-kazandirici-hizmet-finansmani":
      return (
        hasProjectSubjectCategory(analysis, "serviceExport") ||
        hasProjectSubjectCategory(analysis, "softwareSaasPlatform")
      );
    case "yesil-ihracat-finansmani":
      return hasProjectSubjectCategory(analysis, "greenTransformationEnergy");
    case "ige-kefaleti":
      return hasProjectSubjectCategory(analysis, "exportEexportMarketplace");
    case "sevk-oncesi-ihracat-kredisi":
    case "ihracata-hazirlik-kredisi":
    case "isletme-sermayesi-kredisi":
    case "kisa-vadeli-alacak-sigortasi":
      return hasProjectSubjectCategory(analysis, "exportEexportMarketplace");
    default:
      return false;
  }
};

const matchSupport = (
  support: EximbankSupportDefinition,
  f: EximbankFormState,
  selection: EximbankNeedSelection,
): MatchResult => {
  switch (support.id) {
    case "sevk-oncesi-ihracat-kredisi": {
      const relevant = isNeedSelected(selection, "sevkOncesiFinansman") || isNeedSelected(selection, "isletmeSermayesi");
      const matched = hasExporterProfile(f) && f.canProvideExportCommitment && (f.needsRawMaterialOrStockFinance || f.needsPreShipmentCash || f.hasOrderButCashGap);
      return {
        matched,
        relevant,
        positive: [
          "Sevk oncesi uretim/tedarik finansmani ihtiyaci urun amaciyla uyumlu.",
          "Araci banka kanaliyla kullanilabilen kredi yapisina uygun sinyaller mevcut.",
        ],
        negative: [
          "Ihracat taahhudu veya sevk oncesi finansman ihtiyaci net degil.",
          "Ihracat profili/uretim baglantisi zayif oldugunda urun uygunlugu duser.",
        ],
        actions: [
          "Siparis, proforma ve ihracat taahhudu dokumanlari netlestirilmelidir.",
          "Araci banka ve Eximbank kanalinda limit/teminat on gorusmesi yapilmalidir.",
        ],
      };
    }
    case "ihracata-hazirlik-kredisi": {
      const relevant = isNeedSelected(selection, "ihracataHazirlik");
      const matched = hasExporterProfile(f) && f.needsExportPreparationFinance && (f.hasOrderButCashGap || f.needsPreShipmentCash);
      const extraNote = !f.isExporter && f.isExportOrientedManufacturer;
      return {
        matched,
        relevant,
        positive: [
          "Ihracata hazirlik asamasinda finansman ihtiyaci urunle uyumlu.",
          extraNote ? "Ihracatci farkli ise muvafakatname gerekliligi kontrol edilmelidir." : "Ihracatci/imlatci profili uyumlu.",
        ],
        negative: ["Ihracata hazirlik asamasinda belirgin finansman boslugu gorunmuyor."],
        actions: [
          "Hazirlik kapsamindaki nakit ihtiyaci ve siparis baglantisi dokumante edilmelidir.",
          "Gerekirse ihracatci-uretici muvafakat sureci planlanmalidir.",
        ],
      };
    }
    case "isletme-sermayesi-kredisi": {
      const relevant = isNeedSelected(selection, "isletmeSermayesi") || isNeedSelected(selection, "sevkOncesiFinansman");
      const matched =
        hasExporterProfile(f) &&
        f.canProvideExportCommitment &&
        (f.needsWorkingCapitalExpenseFinance || f.needsUtilityPersonnelExpenseFinance || f.needsRawMaterialOrStockFinance);
      return {
        matched,
        relevant,
        positive: [
          "Isletme sermayesi giderleri ihracat finansmaniyla iliskili gorunuyor.",
          "Harcama belgelerine dayali kredi mantigina uygun bir ihtiyac tanimi var.",
        ],
        negative: ["Belgeli gider veya ihracat taahhudu net olmadiginda urun potansiyelde kalir."],
        actions: [
          "Hammadde/enerji/personel gider listesi ve belgeleri hazirlanmalidir.",
          "Ihracat taahhudu, nakit dongusu ve kredi talep formu netlestirilmelidir.",
        ],
      };
    }
    case "yatirim-kredisi": {
      const relevant = isNeedSelected(selection, "yatirimFinansmani");
      const matched = hasExporterProfile(f) && f.hasExportOrientedInvestment && f.investmentImprovesExportCapacity;
      return {
        matched,
        relevant,
        positive: [
          "Ihracat kapasitesini artiran yatirim sinyali mevcut.",
          f.investmentIncentiveHasInterestSupport
            ? "Yatirim Tesvik Belgesi faiz destegi urun uygunlugunu guclendirebilir."
            : "Yatirim odagi Eximbank yatirim finansmani kapsamiyla uyumlu.",
        ],
        negative: ["Yatirim yerine sadece stok/isletme sermayesi ihtiyaci varsa bu urun oncelikli olmayabilir."],
        actions: [
          "Makine-ekipman/tesis yatirim plani ve harcama belgeleri tamamlanmalidir.",
          "Yatirim Tesvik Belgesi varsa faiz destegi unsuru ile birlikte degerlendirilmelidir.",
        ],
      };
    }
    case "ozellikli-ihracat-kredisi": {
      const relevant = isNeedSelected(selection, "yatirimFinansmani") || isNeedSelected(selection, "hizmetIhracatiFinansmani");
      const matched = hasExporterProfile(f) && f.needsLongTermFinanceOver12Months && f.hasNewMarketOrProductProject;
      return {
        matched,
        relevant,
        positive: [
          "12 aydan uzun vadeli finansman gerektiren proje ihtiyaci mevcut.",
          "Yeni pazar/yeni urun odagi ozellikli kredi mantigiyla uyumlu.",
        ],
        negative: ["Standart kisa vadeli nakit ihtiyacinda bu urun yerine diger kisa vadeli urunler daha uygun olabilir."],
        actions: [
          "Proje takvimi, ihracat hedefleri ve uzun vade ihtiyaci sayisal olarak dokumante edilmelidir.",
          "Proje bazli limit, teminat ve geri odeme yapisi on gorusmede netlestirilmelidir.",
        ],
      };
    }
    case "kisa-vadeli-alacak-sigortasi": {
      const relevant = isNeedSelected(selection, "alacakSigortasi");
      const matched = f.hasDeferredSales && hasInsuranceSignal(f) && f.wantsCollectionRiskInsurance;
      return {
        matched,
        relevant,
        positive: [
          "Vadeli/acik hesap satis ve tahsilat riski sigorta urunuyle dogrudan uyumlu.",
          "Ticari ve politik risk yonetimi ihtiyaci belirgin.",
        ],
        negative: ["Pesin satis agirlikli yapi veya alici limit ihtiyaci yoksa urun dusuk oncelikte kalir."],
        actions: [
          "Alici listesi, ulke riski, vade gunu ve satis tutarlariyla limit talebi hazirlanmalidir.",
          "Eximbank alici limiti/sigorta teklif sureci adimlari takip edilmelidir.",
        ],
      };
    }
    case "orta-uzun-vadeli-alacak-sigortasi-garanti": {
      const relevant = isNeedSelected(selection, "alacakSigortasi");
      const matched = hasInsuranceSignal(f) && (f.deferredSalesMaturityDays >= 360 || f.needsOverseasProjectOrUnitFinance);
      return {
        matched,
        relevant,
        positive: [
          "Uzun vadeli satis/proje riski orta-uzun vadeli sigorta-garanti urunleriyle uyumlu.",
          "Yuksek tutarli veya uzun vade alacak riski yonetimi ihtiyaci mevcut.",
        ],
        negative: ["Kisa vadeli standart satislarda kisa vadeli alacak sigortasi daha uygun olabilir."],
        actions: [
          "Uzun vade alacak yapisi, odeme plani ve proje dokumanlari hazirlanmalidir.",
          "Eximbank urun bazli sigorta/garanti modeli icin uygunluk gorusmesi yapilmalidir.",
        ],
      };
    }
    case "yesil-ihracat-finansmani": {
      const relevant = isNeedSelected(selection, "yesilFinansman");
      const matched = hasGreenSignal(f) && f.greenInvestmentLinkedToExportCompetitiveness;
      return {
        matched,
        relevant,
        positive: [
          "Yesil donusum/CBAM/enerji verimliligi ihtiyaci ihracat finansmani ile iliskili.",
          "Surdurulebilirlik odakli yatirimlar rekabet gucu etkisi tasiyor.",
        ],
        negative: ["Teknik proje ve harcama plani olmadan yesil finansman urunlerinde uygunluk zayiflar."],
        actions: [
          "Yesil donusum etkisini gosteren teknik rapor ve harcama plani tamamlanmalidir.",
          "CBAM, karbon ve enerji verimliligi etkileri olculebilir KPI ile dokumante edilmelidir.",
        ],
      };
    }
    case "ige-kefaleti": {
      const relevant = isNeedSelected(selection, "igeKefaleti");
      const matched = hasExporterProfile(f) && (f.hasCollateralAccessProblem || f.bankCreditLimitInsufficient || f.wantsIgeGuarantee);
      return {
        matched,
        relevant,
        positive: [
          "Teminat yetersizligi/kredi limiti ihtiyaci IGE kefalet mekanizmasiyla uyumlu.",
          "Bu arac kredi degil, krediye erisimi kolaylastiran kefalet yapisidir.",
        ],
        negative: ["Teminat sorunu yoksa IGE kefaleti dusuk oncelikte kalabilir."],
        actions: [
          "Ihracatci birligi uyeligi, KOBI/KOSGEB kaydi ve banka sureci dogrulanmalidir.",
          "IGE kefalet basvurusu icin teminat ve kredi dosyasi birlikte hazirlanmalidir.",
        ],
      };
    }
    case "katilim-esasli-urunler": {
      const relevant = hasCreditOrFinanceNeed(selection);
      const matched = hasExporterProfile(f) && f.prefersParticipationFinance;
      return {
        matched,
        relevant,
        positive: [
          "Katilim esasli finansman tercihi urun grubuyla uyumlu.",
          "Ihracat odakli faaliyetle birlikte faizsiz alternatif arayisi mevcut.",
        ],
        negative: ["Katilim esasli finansman tercihi belirtilmediginde urun dusuk oncelikte kalir."],
        actions: [
          "Guncel katilim esasli Eximbank urun secenekleri urun bazinda teyit edilmelidir.",
          "Vade, oran ve teminat yapisi icin kurumdan guncel teklif alinmalidir.",
        ],
      };
    }
    case "doviz-kazandirici-hizmet-finansmani": {
      const relevant = isNeedSelected(selection, "hizmetIhracatiFinansmani") || isNeedSelected(selection, "ihracataHazirlik");
      const matched =
        f.hasForeignCurrencyService &&
        (f.hasFxServiceInvoices || f.collectsThroughBankingChannel) &&
        (f.hasForeignBuyerInformation || f.hasExportOrderOrContract);
      return {
        matched,
        relevant,
        positive: [
          "Doviz kazandirici hizmet faaliyetleri finansman urunuyle uyumlu.",
          "Yurt disi musteri/satis/odeme baglantisi mevcut gorunuyor.",
        ],
        negative: ["Hizmet ihracati belgesi veya doviz tahsilat kaniti zayifsa uygunluk duser."],
        actions: [
          "Hizmet sozlesmeleri, faturalar ve doviz tahsilat kayitlari dosyalanmalidir.",
          "Yurt disi musteri listesi ve hizmet teslim kanitlari netlestirilmelidir.",
        ],
      };
    }
    case "serbest-bolge-finansmani": {
      const relevant = hasCreditOrFinanceNeed(selection);
      const matched = f.companyType === "SerbestBolgeKullanicisi" && hasExporterProfile(f) && hasStrongExportSignal(f);
      return {
        matched,
        relevant,
        positive: [
          "Serbest bolge faaliyet yapisi ve ihracat baglantisi urunle uyumlu.",
          "Ihracat odakli finansman ihtiyaci serbest bolge kullanicilari icin de degerlendirilebilir.",
        ],
        negative: ["Serbest bolge faaliyeti veya ihracat baglantisi net degilse urun potansiyelde kalir."],
        actions: [
          "Serbest bolge faaliyet belgesi ve ihracat baglanti dokumanlari tamamlanmalidir.",
          "Finansman konusu ve urun uygunlugu Eximbank ile urun bazinda teyit edilmelidir.",
        ],
      };
    }
    default:
      return {
        matched: false,
        relevant: true,
        positive: [],
        negative: [riskText],
        actions: ["Finansman ihtiyaci ve belge seti urune uygun sekilde yeniden kurgulanmalidir."],
      };
  }
};

const resolveStatus = (
  support: EximbankSupportDefinition,
  f: EximbankFormState,
  match: MatchResult,
): EximbankSupportStatus => {
  if (!f.isTurkeyResident) return "UYGUN DEGIL / RISKLI";

  if (!match.relevant) return "POTANSIYEL";

  if (!hasExporterProfile(f) && support.id !== "ige-kefaleti") return "UYGUN DEGIL / RISKLI";

  if (!match.matched) return "UYGUN DEGIL / RISKLI";

  if (hasDocumentGaps(f) || f.hasCreditRisk) return "POTANSIYEL";

  if (!f.canProvideExportCommitment && support.productClass === "KREDI") return "POTANSIYEL";

  if (support.id === "ige-kefaleti" && (!f.isExporterUnionMember || !f.isKobi)) return "POTANSIYEL";

  if (support.productClass === "SIGORTA" && (!f.hasBuyerListAndAging || !f.knowsBuyerAndCountryRisk)) return "POTANSIYEL";

  if (support.id === "yesil-ihracat-finansmani" && !f.hasTechnicalProjectAndExpensePlan) return "POTANSIYEL";

  return "UYGUN";
};

const getProductRiskNotes = (support: EximbankSupportDefinition, f: EximbankFormState): string[] => {
  const notes: string[] = [sourceWarningText, finalSuitabilityWarning, notGrantWarning];

  if (f.hasTaxOrSgkDebt) notes.push("Vergi/SGK borcu kredi ve sigorta degerlendirmesinde risk notu olusturabilir.");
  if (f.hasCreditRisk) notes.push("Kredi sicili/finansal rasyo riski nedeniyle banka ve Eximbank analizi kritik olur.");
  if (!f.canProvideExportCommitment && support.productClass === "KREDI") {
    notes.push("Ihracat taahhudu net olmadiginda kredi urunlerinde uygunluk zayiflar.");
  }
  if (support.id === "ige-kefaleti") {
    notes.push("IGE kredi vermez; krediye erisimde kefalet/garanti mekanizmasi saglar.");
  }

  return notes;
};

const productSpecificRequiredDocuments = (supportId: string): string[] => {
  switch (supportId) {
    case "kisa-vadeli-alacak-sigortasi":
    case "orta-uzun-vadeli-alacak-sigortasi-garanti":
      return ["Alici listesi", "Alacak yaslandirma raporu", "Vade ve ulke risk bilgileri", "Satis sozlesmeleri"];
    case "ige-kefaleti":
      return ["Teminat belgeleri", "Ihracatci birligi uyelik bilgisi", "KOSGEB kaydi (varsa)", "IGE/banka basvuru evraki"];
    case "yesil-ihracat-finansmani":
      return ["Surdurulebilirlik raporu", "CBAM/karbon etki calismasi", "Teknik proje ve harcama plani"];
    case "yatirim-kredisi":
      return ["Yatirim harcama listesi", "Makine-ekipman proformalari", "Yatirim Tesvik Belgesi (varsa)"];
    default:
      return [];
  }
};

export const evaluateEximbankSupports = (
  form: EximbankFormState,
  selection: EximbankNeedSelection,
): EximbankSupportResult[] => {
  const projectSubjectAnalysis = getStoredProjectSubjectAnalysis();

  return eximbankSupports
    .map((support) => ({ support, match: matchSupport(support, form, selection) }))
    .filter(({ match }) => match.relevant)
    .map(({ support, match }) => {
    let status = resolveStatus(support, form, match);

    const whyEligible = status !== "UYGUN DEGIL / RISKLI" && match.matched ? [...match.positive] : [];
    const whyNotEligible = status === "UYGUN DEGIL / RISKLI" ? [...match.negative] : [];
    const howToBecomeEligible = status === "UYGUN DEGIL / RISKLI" ? [...match.actions] : [];

    if (projectSubjectCanPromoteEximbank(projectSubjectAnalysis, support.id)) {
      whyEligible.push("Proje konusu serbest metni bu finansman araciyla uyumlu bir ihtiyac sinyali veriyor.");

      if (status === "UYGUN DEGIL / RISKLI" && form.isTurkeyResident) {
        status = "POTANSIYEL";
        whyNotEligible.push("Konu uyumu olumlu olsa da ihracat, belge ve banka/Eximbank degerlendirmesi ayrica tamamlanmalidir.");
        howToBecomeEligible.push("Konuya uygun ihracat baglantisi, siparis ve finansman dosyasi daha net hale getirilmelidir.");
      }
    }

    if (!match.relevant) {
      whyNotEligible.push("Secilen finansman ihtiyaci tiplerinde bu urun birincil oncelikte degil.");
      howToBecomeEligible.push("Ihtiyac tipi seciminde ilgili basligi aktif ederek urun tekrar degerlendirilmelidir.");
    }

    if (!form.isTurkeyResident) {
      whyNotEligible.push("Firma Turkiye'de yerlesik olmadigindan Eximbank urunlerinde uygunluk zayiflar.");
    }

    if (!hasExporterProfile(form)) {
      whyNotEligible.push("Ihracatci/imalatci-ihracatci/doviz kazandirici hizmet profili net degil.");
      howToBecomeEligible.push("Ihracat profili ve doviz kazandirici faaliyet dokumanlari guclendirilmelidir.");
    }

    if (!form.canProvideExportCommitment && support.productClass === "KREDI") {
      whyNotEligible.push("Ihracat taahhudu verilemiyor veya net degil.");
      howToBecomeEligible.push("Siparis, sozlesme ve taahhut altyapisi ile ihracat baglantisi netlestirilmelidir.");
    }

    if (status === "POTANSIYEL" && !hasCoreFinancialDocs(form)) {
      whyNotEligible.push("Mali tablolar veya guncel mizan eksik oldugundan kesin uygunluk verilemedi.");
      howToBecomeEligible.push("Son donem mali tablolar, mizan ve vergi beyan seti tamamlanmalidir.");
    }

    if (status === "POTANSIYEL" && !hasCoreExportDocs(form)) {
      whyNotEligible.push("Ihracat beyannamesi/satis sozlesmesi/siparis seti eksik oldugundan dosya guclendirilmeli.");
      howToBecomeEligible.push("Ihracat belgelendirme seti (beyanname, sozlesme, PO/proforma) tamamlanmalidir.");
    }

    if (status === "UYGUN DEGIL / RISKLI" && whyNotEligible.length === 0) {
      whyNotEligible.push(riskText);
    }

    const howToGet =
      status === "UYGUN"
        ? [
            "Firma ihracat ve finansman ihtiyaci acisindan on uygunluk kriterlerini sagliyor.",
            "Turk Eximbank musteri kaydi/limit durumu kontrol edilir.",
            "Ihracat beyannameleri, siparis/sozlesme belgeleri, mali tablolar, kredi talep formu, harcama listesi ve teminat/kefalet belgeleri hazirlanir.",
            "Urune gore Eximbank subesi, araci banka veya ilgili basvuru kanali uzerinden basvuru yapilir.",
            "Nihai limit, vade, oran ve teminat yapisi Eximbank/banka degerlendirmesiyle belirlenir.",
          ]
        : status === "POTANSIYEL"
          ? [potentialText, ...commonHowToGet]
          : [];

    const nextAction =
      status === "UYGUN"
        ? "Urun odakli basvuru dosyasini tamamlayip Eximbank/araci banka/IGE kanalinda on degerlendirmeyi baslatin."
        : status === "POTANSIYEL"
          ? "Eksik belge, ihracat taahhudu ve teminat altyapisini guclendirip urunu tekrar degerlendirin."
          : "Ihracat baglantisi, belge seti ve finansman ihtiyacini urun amacina uygun sekilde yeniden kurgulayin.";

    const extraDocs = productSpecificRequiredDocuments(support.id);
    const requiredDocuments = Array.from(new Set([...extraDocs, ...commonRequiredDocuments]));

    const riskNote = getProductRiskNotes(support, form).join(" ");

    return {
      id: support.id,
      supportName: support.supportName,
      status,
      institution: support.institution,
      productClass: support.productClass,
      applicantProfile: support.applicantProfile,
      suitableNeed: support.suitableNeed,
      financeSubject: support.financeSubject,
      whyEligible,
      howToGet,
      whyNotEligible,
      howToBecomeEligible,
      requiredDocuments,
      applicationChannel: support.applicationChannel,
      nextAction,
      riskNote,
      sourceWarning: sourceWarningText,
    };
  });
};

export const summarizeEximbankResults = (
  results: EximbankSupportResult[],
  form: EximbankFormState,
  selection: EximbankNeedSelection,
): EximbankSummary => {
  const uygunCount = results.filter((item) => item.status === "UYGUN").length;
  const potansiyelCount = results.filter((item) => item.status === "POTANSIYEL").length;
  const riskliCount = results.filter((item) => item.status === "UYGUN DEGIL / RISKLI").length;

  const isOpportunity = (status: EximbankSupportStatus) => status === "UYGUN" || status === "POTANSIYEL";

  const krediClasses: EximbankProductClass[] = ["KREDI", "YESIL_FINANSMAN"];
  const sigortaKefaletClasses: EximbankProductClass[] = ["SIGORTA", "KEFALET", "GARANTI"];

  const krediOpportunityCount = results.filter((item) => isOpportunity(item.status) && krediClasses.includes(item.productClass)).length;
  const sigortaKefaletOpportunityCount = results.filter(
    (item) => isOpportunity(item.status) && sigortaKefaletClasses.includes(item.productClass),
  ).length;

  return {
    uygunCount,
    potansiyelCount,
    riskliCount,
    krediOpportunityCount,
    sigortaKefaletOpportunityCount,
    missingDocumentCount: calculateMissingDocumentCount(form),
    finansmanHazirlikScore: calculateFinanceReadinessScore(form),
    ihracatFinansmanUygunlukScore: calculateExportFinanceSuitabilityScore(form, selection),
  };
};
