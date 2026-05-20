import { vergiselTesvikSupports } from "../data/vergiselTesvikSupports";
import {
  VergiselNeedSelection,
  VergiselScoreInfo,
  VergiselSummary,
  VergiselSupportDefinition,
  VergiselSupportResult,
  VergiselSupportStatus,
  VergiselTesvikFormState,
  VergiTuru,
} from "../types";

const sourceWarningText =
  "Vergisel tesviklerde oranlar, istisna tutarlari, sureler, belge sartlari ve uygulama usulleri donemsel olarak degisebilir. Guncel bilgi GIB, Sanayi ve Teknoloji Bakanligi, Ticaret Bakanligi, ilgili kanun/tebligler ve resmi idari duzenlemelerden kontrol edilmelidir.";

const finalSuitabilityWarning =
  "Nihai uygulama guncel kanun, teblig, ozelge, idari uygulama, beyanname ve belge setiyle dogrulanmalidir.";

const commonHowToApply = [
  "Ilgili tesvikin dayanak mevzuati, belge kosullari ve beyanname etkisi guncel haliyle kontrol edilir.",
  "Gelir, gider, personel ve harcamalar tesvik kapsamina gore muhasebede ayrilir ve dokumante edilir.",
  "Beyanname, bordro, KDV iade, DYS veya E-TUYS sureci gerekiyorsa mevzuata uygun sekilde tamamlanir.",
  "Uygulama oncesinde SMMM/YMM kontrolu ve risk degerlendirmesi yapilir.",
];

const potentialText =
  "Faaliyet vergi avantajina uygun gorunuyor ancak belge, proje onayi, ruhsat, muhasebe ayrismasi, beyanname etkisi, YMM raporu veya kurum onayi dogrulanmadan kesin uygunluk verilemez.";

const riskText =
  "Tesvik su an uygun gorunmuyor cunku mukellef turu, faaliyet konusu, belge/proje onayi, yatirim tesvik belgesi, serbest bolge ruhsati, teknokent statusu veya ihracat/ispat sartlari saglanmiyor.";

const commonRequiredDocuments = [
  "Vergi levhasi",
  "Ticaret sicil gazetesi",
  "Imza sirkuleri",
  "Faaliyet belgesi",
  "Kurumlar vergisi / gelir vergisi beyannameleri",
  "KDV beyannameleri",
  "Muhtasar ve prim hizmet beyannamesi",
  "E-defter/e-fatura kayitlari",
  "YMM calisma dosyasi (gerekiyorsa)",
  "Fatura/dekont/sozlesme dosyasi",
];

interface MatchResult {
  matched: boolean;
  relevant: boolean;
  positive: string[];
  negative: string[];
  actions: string[];
}

const isRelevantForSelection = (id: string, selection: VergiselNeedSelection): boolean => {
  switch (id) {
    case "genc-girisimci-kazanc-istisnasi":
      return selection.gencGirisimci;
    case "teknokent-kazanc-istisnasi":
    case "teknokent-personel-stopaj-damga":
    case "teknokent-kdv-istisnasi":
      return selection.teknokent4691;
    case "arge-indirimi-5746":
    case "arge-stopaj-5746":
    case "arge-damga-istisna-5746":
    case "arge-gumruk-istisna-5746":
      return selection.arge5746;
    case "ytb-kdv-istisnasi":
    case "ytb-gumruk-muafiyeti":
    case "ytb-vergi-indirimi":
    case "ytb-kdv-iadesi":
      return selection.ytbVergiAvantaj;
    case "serbest-bolge-kazanc-istisnasi":
    case "serbest-bolge-ucret-istisnasi":
    case "serbest-bolge-kdv-damga-harc":
      return selection.serbestBolge;
    case "mal-ihracati-kdv-istisna-iade":
    case "hizmet-ihracati-kdv-istisna":
    case "hizmet-ihracati-kazanc-indirimi":
    case "ihrac-kayitli-teslim-kdv":
      return selection.ihracatHizmetIhracati || selection.kdvIstisnaIade;
    case "vrhib":
      return selection.vrhib || selection.ihracatHizmetIhracati;
    case "osb-vergisel-avantajlar":
      return selection.osb;
    case "lisansli-depoculuk-avantajlari":
      return selection.lisansliDepoculuk;
    case "yan-hak-bordro-optimizasyonu":
      return selection.bordroOptimizasyon;
    default:
      return true;
  }
};

const hasAnyCoreActivity = (f: VergiselTesvikFormState): boolean =>
  f.hasTeknokentActivity ||
  f.hasArgeProject ||
  f.hasYatirimTesvikCertificate ||
  f.hasFreeZoneActivity ||
  f.doesGoodsExport ||
  f.doesServiceExport ||
  f.isInOsb ||
  f.hasMealBenefit;

const hasAnyStatusDocument = (f: VergiselTesvikFormState): boolean =>
  f.hasTeknokentActivityDoc ||
  f.hasTeknokentProjectApproval ||
  f.hasArgeCenterDoc ||
  f.hasDesignCenterDoc ||
  f.hasYatirimTesvikCertificate ||
  f.hasFreeZoneLicense ||
  f.hasExportInvoicesAndCustomsDocs ||
  f.willApplyVrhibViaDys;

const hasCoreAccounting = (f: VergiselTesvikFormState): boolean =>
  f.hasSeparateAccountingAccounts && f.hasProjectCostCenters && f.hasInvoiceBankContractFiles;

const hasLowRisk = (f: VergiselTesvikFormState): boolean =>
  !f.hasTaxDebt && !f.hasSgkDebt && !f.hasTaxRiskHistory && !f.hasSpecialPrinciplesRisk;

const calculateVergiselUygunlukScore = (f: VergiselTesvikFormState): VergiselScoreInfo => {
  let score = 0;

  if (f.mukellefType !== "DIGER" && hasAnyCoreActivity(f)) score += 10;
  if (hasAnyStatusDocument(f)) score += 15;
  if (f.hasSeparateAccountingAccounts && f.hasProjectCostCenters && f.hasPersonnelTimeRecords) score += 15;
  if (f.filingsRegular && f.analyzesPayrollTaxAndSgkEffects) score += 10;
  if (f.hasInvoiceBankContractFiles) score += 10;
  if (hasLowRisk(f)) score += 10;
  if (f.worksWithAdvisor) score += 10;
  if (f.hasKdvListsAndDeclarations || f.hasExportInvoicesAndCustomsDocs || f.hasTeknokentProjectApproval || f.hasArgeProject)
    score += 10;
  if (f.doesPeriodicIncentiveControls) score += 10;

  if (score <= 39) return { score, comment: "0-39: Vergisel tesvik uygulamasi icin zayif / ciddi eksik var" };
  if (score <= 69) return { score, comment: "40-69: Potansiyel, belge ve muhasebe altyapisi guclendirilmeli" };
  return { score, comment: "70-100: Guclu vergisel tesvik adayi" };
};

const calculateBelgeMuhasebeHazirlikScore = (f: VergiselTesvikFormState): VergiselScoreInfo => {
  let score = 0;

  if (f.isTaxPayerInTurkey && f.hasEdocsObligation) score += 10;
  if (hasAnyStatusDocument(f)) score += 15;
  if (f.hasSeparateAccountingAccounts && f.hasProjectCostCenters) score += 15;
  if (f.hasPersonnelTimeRecords) score += 10;
  if (f.hasDeclarationControls && f.filingsRegular) score += 10;
  if (f.hasInvoiceBankContractFiles) score += 10;
  if (f.hasKdvListsAndDeclarations || f.preparesKdvRefundFile) score += 10;
  if (f.worksWithAdvisor || f.needsYmmReportGeneral) score += 10;
  if (f.willApplyVrhibViaDys || f.hasETuysApplication || f.hasAuthorityPermitsAndLicenses) score += 10;

  if (score <= 39) return { score, comment: "0-39: Vergisel uygulama altyapisi hazir degil" };
  if (score <= 69) return { score, comment: "40-69: Eksik belge ve muhasebe hazirligi tamamlanmali" };
  return { score, comment: "70-100: Uygulama hazirligi guclu" };
};

const calculateMissingDocumentCount = (f: VergiselTesvikFormState): number => {
  const checks = [
    f.hasEdocsObligation,
    f.hasDeclarationControls,
    f.hasSeparateAccountingAccounts,
    f.hasProjectCostCenters,
    f.hasPersonnelTimeRecords,
    f.hasInvoiceBankContractFiles,
    f.hasKdvListsAndDeclarations,
    f.worksWithAdvisor,
    f.doesPeriodicIncentiveControls,
    f.hasAuthorityPermitsAndLicenses,
  ];
  return checks.filter((item) => !item).length;
};

const productSpecificDocuments = (id: string): string[] => {
  switch (id) {
    case "genc-girisimci-kazanc-istisnasi":
      return ["Genc girisimci ise baslama bildirimi", "Ortaklik ve mukellefiyet belgeleri"];
    case "teknokent-kazanc-istisnasi":
    case "teknokent-personel-stopaj-damga":
    case "teknokent-kdv-istisnasi":
      return ["Teknokent faaliyet belgesi", "Teknokent proje onayi", "Yonetici sirket yazilari", "Bordro kayitlari"];
    case "arge-indirimi-5746":
    case "arge-stopaj-5746":
    case "arge-damga-istisna-5746":
    case "arge-gumruk-istisna-5746":
      return ["Ar-Ge/Tasarim merkezi belgesi", "Ar-Ge proje dosyalari", "Personel zaman cizelgeleri"];
    case "ytb-kdv-istisnasi":
    case "ytb-gumruk-muafiyeti":
    case "ytb-vergi-indirimi":
    case "ytb-kdv-iadesi":
      return ["Yatirim Tesvik Belgesi", "Makine-tecizat listesi", "DYS/E-TUYS basvuru evraklari"];
    case "serbest-bolge-kazanc-istisnasi":
    case "serbest-bolge-ucret-istisnasi":
    case "serbest-bolge-kdv-damga-harc":
      return ["Serbest bolge faaliyet ruhsati", "Serbest bolge islem formlari"];
    case "mal-ihracati-kdv-istisna-iade":
    case "hizmet-ihracati-kdv-istisna":
    case "hizmet-ihracati-kazanc-indirimi":
      return ["Ihracat faturalari", "Gumruk beyannameleri", "Hizmet ihracati sozlesmeleri", "Doviz tahsilat belgeleri"];
    case "vrhib":
      return ["VRHIB basvuru belgeleri", "DYS basvuru evraklari"];
    case "osb-vergisel-avantajlar":
      return ["OSB/tapu/kira/insaat belgeleri"];
    case "lisansli-depoculuk-avantajlari":
      return ["Lisansli depoculuk sozlesmeleri", "Urun senedi evraklari"];
    default:
      return [];
  }
};

const matchSupport = (
  support: VergiselSupportDefinition,
  f: VergiselTesvikFormState,
  selection: VergiselNeedSelection,
): MatchResult => {
  const relevant = isRelevantForSelection(support.id, selection);

  switch (support.id) {
    case "genc-girisimci-kazanc-istisnasi": {
      const matched =
        f.isRealPersonEntrepreneur &&
        f.firstIncomeTaxRegistration &&
        f.underAgeLimitAtStart &&
        f.notifiedStartOnTime &&
        f.operatesOwnNameAndAccount &&
        !f.usedYoungEntrepreneurBefore &&
        !f.isBusinessTransferCase;
      return {
        matched,
        relevant,
        positive: [
          "Genc girisimci istisnasi icin gercek kisi ve ilk mukellefiyet kosullari saglanma sinyali veriyor.",
          "Istisna tutari/sure takibi yapildiginda uygulama guvenli hale gelir.",
          "2026 sonrasi Bag-Kur prim tesviki durumu ayrica kontrol edilmelidir.",
        ],
        negative: ["Yas, ilk mukellefiyet veya devir kosulu saglanmiyor olabilir."],
        actions: ["Mukellefiyet baslangic, yas ve devir kontrolleri belgeyle dogrulanmalidir."],
      };
    }
    case "teknokent-kazanc-istisnasi": {
      const matched =
        f.hasTeknokentActivity &&
        f.hasTeknokentActivityDoc &&
        f.hasTeknokentProjectApproval &&
        f.hasSoftwareArgeDesignProject &&
        f.separatesProjectIncomeInAccounting &&
        f.tracksInOutRegionActivities;
      return {
        matched,
        relevant,
        positive: [
          "4691 kapsaminda proje bazli gelir ayrimi ve teknokent belgelendirmesi gorunuyor.",
          "Kazanc istisnasi icin proje disi gelir ayrimi yapilabiliyor.",
        ],
        negative: ["Bolge disi/proje disi gelir ayrismasi yoksa risk artar."],
        actions: ["Gelirlerin proje bazli ayristirilmasi ve YMM/SMMM kontrolu guclendirilmelidir."],
      };
    }
    case "teknokent-personel-stopaj-damga": {
      const matched =
        f.hasTeknokentActivity &&
        f.classifiesArgeSupportPersonnel &&
        f.tracksInOutRegionWorkTime &&
        f.tracksRemoteWorkAndClassification &&
        f.hasDeclarationControls;
      return {
        matched,
        relevant,
        positive: ["Personel siniflandirma ve bordro takibi stopaj/damga avantajina uyumlu gorunuyor."],
        negative: ["Personel puantaj ve bolge ici/disi sure takibi zayifsa riskli olur."],
        actions: ["Bordro, puantaj ve muhtasar beyanname eslestirmesi duzenli kontrol edilmelidir."],
      };
    }
    case "teknokent-kdv-istisnasi": {
      const matched = f.hasTeknokentActivity && f.evaluatesTeknokentKdvException && f.hasTeknokentProjectApproval;
      return {
        matched,
        relevant,
        positive: ["Yazilim teslimlerinde 4691 kapsaminda KDV istisnasi degerlendirme altyapisi var."],
        negative: ["Her yazilim/hizmet KDV istisnasi kapsaminda degildir; teslim turu kontrol edilmelidir."],
        actions: ["Fatura aciklamalari ve proje kapsam eslesmesi dokumante edilmelidir."],
      };
    }
    case "arge-indirimi-5746": {
      const matched =
        (f.hasArgeCenterDoc || f.hasDesignCenterDoc) &&
        f.hasArgeProject &&
        f.tracksArgeExpensesSeparately &&
        f.calculatesArgeDeduction &&
        f.documentsArgeQualification;
      return {
        matched,
        relevant,
        positive: ["5746 Ar-Ge indirimi icin belge, proje ve muhasebe ayrimi sinyali mevcut."],
        negative: ["Ar-Ge niteligini destekleyen dokumantasyon zayifsa ceza riski olusabilir."],
        actions: ["Harcama kalemleri ve proje baglari detayli calisma dosyasinda tutulmalidir."],
      };
    }
    case "arge-stopaj-5746": {
      const matched =
        (f.hasArgeCenterDoc || f.hasDesignCenterDoc) &&
        f.appliesIncomeTaxWithholdingSupport &&
        f.hasTimesheetRecords &&
        f.hasSufficientArgePersonnel;
      return {
        matched,
        relevant,
        positive: ["Personel ve puantaj takibi 5746 stopaj terkin uygulamasiyla uyumlu."],
        negative: ["Personel niteligi/sure takibi yetersiz oldugunda tesvik riski artar."],
        actions: ["Puantaj ve personel nitelik dosyalari bordro ile birlikte kontrol edilmelidir."],
      };
    }
    case "arge-damga-istisna-5746": {
      const matched = (f.hasArgeCenterDoc || f.hasDesignCenterDoc) && f.appliesStampTaxException;
      return {
        matched,
        relevant,
        positive: ["Ar-Ge faaliyetine bagli kagitlar icin damga vergisi istisnasi potansiyeli var."],
        negative: ["Ar-Ge ile iliskisiz sozlesmelerde istisna uygulanamaz."],
        actions: ["Kagit kapsam analizi yapilip yalniz ilgili belgeler istisnaya dahil edilmelidir."],
      };
    }
    case "arge-gumruk-istisna-5746": {
      const matched = (f.hasArgeCenterDoc || f.hasDesignCenterDoc) && f.hasCustomsOrKdvExceptionPotential;
      return {
        matched,
        relevant,
        positive: ["Ar-Ge ithalatinda gumruk vergisi istisnasi icin potansiyel mevcut."],
        negative: ["Ithalat/proje bagi net degilse istisna riske girer."],
        actions: ["Ithal esya, proje ve kurum onay sureci dosya bazli takip edilmelidir."],
      };
    }
    case "ytb-kdv-istisnasi": {
      const matched = f.hasYatirimTesvikCertificate && f.hasMachineryPurchaseForKdvException && f.machineryListMatchesDocs;
      return {
        matched,
        relevant,
        positive: ["YTB kapsaminda makine-tecizat alimlarinda KDV istisnasi altyapisi var."],
        negative: ["Belge oncesi alim veya makine listesi uyumsuzlugu risklidir."],
        actions: ["Belge kapsam-fatura-beyanname uyumu satir bazli kontrol edilmelidir."],
      };
    }
    case "ytb-gumruk-muafiyeti": {
      const matched = f.hasYatirimTesvikCertificate && f.needsCustomsExemptionForImportedMachinery && f.machineryListMatchesDocs;
      return {
        matched,
        relevant,
        positive: ["YTB ve ithal makine listesi gumruk vergisi muafiyeti icin uygun gorunuyor."],
        negative: ["GTIP veya liste uyumsuzlugunda muafiyet riski vardir."],
        actions: ["Ithalat oncesi GTIP ve belge kapsam kontrolu yapilmalidir."],
      };
    }
    case "ytb-vergi-indirimi": {
      const matched = f.hasYatirimTesvikCertificate && f.hasCorporateTaxDiscountSupport && f.tracksInvestmentExpensesSeparately;
      return {
        matched,
        relevant,
        positive: ["YTB vergi indirimi unsuru icin temel kosullar saglaniyor."],
        negative: ["Yatirima katki tutari-kazanc iliskisi hesaplanmadan uygulama yapilamaz."],
        actions: ["Donemsel katki tutari ve indirimli kurumlar vergisi hesaplari detayli calisilmalidir."],
      };
    }
    case "ytb-kdv-iadesi": {
      const matched = f.hasYatirimTesvikCertificate && f.willRequestKdvRefund && f.preparesKdvRefundFile;
      return {
        matched,
        relevant,
        positive: ["YTB baglantili KDV iadesi icin dosya hazirlik sinyali mevcut."],
        negative: ["Iade mevzuati ve belge seti tam dogrulanmadan kesin uygunluk verilemez."],
        actions: ["KDV iade listeleri, YMM raporu ve belge kontrolu tamamlanmalidir."],
      };
    }
    case "serbest-bolge-kazanc-istisnasi": {
      const matched =
        f.hasFreeZoneActivity && f.hasFreeZoneLicense && f.licenseScopeMatchesIncomeTypes && f.tracksFreeZoneIncomeSeparately;
      return {
        matched,
        relevant,
        positive: [
          "Serbest bolge ruhsati ve gelir ayrimi kazanc istisnasi icin uygunluk sinyali veriyor.",
          "Uretici firmalarin belirli serbest bolge ici ve diger serbest bolge satislari guncel duzenlemelerle ayrica kontrol edilmelidir.",
        ],
        negative: ["Ruhsat kapsami disi gelirler veya ayrismayan muhasebe kayitlari risk yaratir."],
        actions: ["Gelir turleri ruhsat kapsamiyla eslestirilerek ayri muhasebe takibi yapilmalidir."],
      };
    }
    case "serbest-bolge-ucret-istisnasi": {
      const matched =
        f.hasFreeZoneActivity &&
        f.hasFreeZoneLicense &&
        f.freeZoneActivityTypeProduction &&
        f.evaluatesWageTaxExceptionInFreeZone &&
        f.hasDeclarationControls;
      return {
        matched,
        relevant,
        positive: ["Serbest bolge ucret stopaj istisnasi icin uretim ve bordro takip kosullari mevcut."],
        negative: ["Uretim ve oran kosullari saglanmazsa istisna uygulanamaz."],
        actions: ["Personel bordro ve serbest bolge oran kosullari donemsel izlenmelidir."],
      };
    }
    case "serbest-bolge-kdv-damga-harc": {
      const matched =
        f.hasFreeZoneActivity && f.hasFreeZoneLicense && f.evaluatesKdvCustomsStampAdvantagesInFreeZone;
      return {
        matched,
        relevant,
        positive: ["Serbest bolge islem turleri icin coklu vergi avantaji degerlendirmesi yapiliyor."],
        negative: ["Her islem otomatik istisna degildir; islem turu ve belge seti sarttir."],
        actions: ["Islem bazli mevzuat matrisi ile belge kontrolu yapilmalidir."],
      };
    }
    case "mal-ihracati-kdv-istisna-iade": {
      const matched = f.doesGoodsExport && f.hasExportInvoicesAndCustomsDocs && f.preparesKdvRefundFile;
      return {
        matched,
        relevant,
        positive: ["Mal ihracati icin KDV istisna ve iade dosyasi altyapisi mevcut."],
        negative: ["GCB, yuklenilen KDV listesi ve belge tutarliligi eksikse iade riski artar."],
        actions: ["KDV iade dosyasi ve ozel esas risk taramasi tamamlanmalidir."],
      };
    }
    case "hizmet-ihracati-kdv-istisna": {
      const matched =
        f.doesServiceExport && f.canProveServiceExportConditions && f.collectsExportProceedsViaBank;
      return {
        matched,
        relevant,
        positive: ["Hizmet ihracatinda yurt disinda faydalanma ve doviz tahsilat ispatlari olusuyor."],
        negative: ["Hizmetten yurt disinda faydalanma ispatlanamazsa KDV istisnasi uygulanamaz."],
        actions: ["Sozlesme, fatura, doviz tahsilat ve hizmet ifa kanitlari guclendirilmelidir."],
      };
    }
    case "hizmet-ihracati-kazanc-indirimi": {
      const matched =
        f.doesServiceExport && f.hasFxServiceTypes && f.evaluatesServiceExportTaxDeduction && f.collectsExportProceedsViaBank;
      return {
        matched,
        relevant,
        positive: ["Doviz kazandirici hizmet gelirlerinde kazanc indirimi potansiyeli var."],
        negative: ["Musteri yeri, faydalanma kosulu ve tahsilat belgeleri olmadan avantaj riske girer."],
        actions: ["Hizmet turu ve mevzuat maddesi bazli uygunluk matrisi hazirlanmalidir."],
      };
    }
    case "ihrac-kayitli-teslim-kdv": {
      const matched = f.hasExportRegisteredDeliveries && f.hasExportSales;
      return {
        matched,
        relevant,
        positive: ["Ihrac kayitli teslim zinciri icin KDV tecil-terkin potansiyeli mevcut."],
        negative: ["Imalatci niteligi ve ihracatin sure icinde gerceklesmesi kritik kosuldur."],
        actions: ["Teslim-ihracat sureleri ve imalatci belgeleri takip edilmelidir."],
      };
    }
    case "vrhib": {
      const matched =
        (f.hasFxEarningTransaction || f.needsVrhib) &&
        f.hasExportLinkedContracts &&
        f.hasStampAndFeeGeneratingTransactions &&
        f.willApplyVrhibViaDys &&
        !f.contractSignedBeforeVrhib;
      return {
        matched,
        relevant,
        positive: ["VRHIB icin doviz kazandirici islem ve DYS basvuru sinyali mevcut."],
        negative: ["Belge oncesi imzalanan sozlesmelerde istisna riski vardir."],
        actions: ["Belge kapsami, sure, tutar ve sozlesme tarihleri uyumlu hale getirilmelidir."],
      };
    }
    case "osb-vergisel-avantajlar": {
      const matched = f.isInOsb && f.evaluatesOsbTaxExemptions;
      return {
        matched,
        relevant,
        positive: ["OSB baglantili vergi alanlari degerlendiriliyor ve potansiyel mevcut."],
        negative: ["Islem turu net degilse emlak/KDV/harc avantajlari yanlis uygulanabilir."],
        actions: ["OSB islem turu bazinda muafiyet konulari belgeyle netlestirilmelidir."],
      };
    }
    case "lisansli-depoculuk-avantajlari": {
      const matched = selection.lisansliDepoculuk;
      return {
        matched,
        relevant,
        positive: ["Lisansli depoculukte donemsel vergi avantajlari icin inceleme ihtiyaci var."],
        negative: ["Sartlar donemsel degistigi icin guncel mevzuat teyidi olmadan kesin uygunluk verilmez."],
        actions: ["Guncel istisna sure ve tutarlari resmi kaynaklardan dogrulanmalidir."],
      };
    }
    case "yan-hak-bordro-optimizasyonu": {
      const matched =
        f.hasMealBenefit ||
        f.hasTransportBenefit ||
        f.hasBonusSystem ||
        f.hasPrivateHealthOrBesContribution ||
        f.hasBoardAllowancePayment ||
        f.doesNetBrutPlanning;
      return {
        matched,
        relevant,
        positive: ["Yemek, yol, prim ve yan haklarda bordro vergi optimizasyon potansiyeli bulunuyor."],
        negative: ["Guncel istisna tutarlari ve SGK/vergisel sinirlar izlenmezse risk olusur."],
        actions: ["Bordro kalemleri aylik limit, vergi ve SGK etkisiyle birlikte yeniden modellenmelidir."],
      };
    }
    default:
      return {
        matched: false,
        relevant,
        positive: [],
        negative: [riskText],
        actions: ["Faaliyet ve belge seti mevzuata uygun sekilde yeniden kurgulanmalidir."],
      };
  }
};

const resolveStatus = (
  support: VergiselSupportDefinition,
  f: VergiselTesvikFormState,
  match: MatchResult,
): VergiselSupportStatus => {
  if (!f.isTaxPayerInTurkey) return "UYGUN DEGIL / RISKLI";
  if (!match.relevant) return "POTANSIYEL";
  if (!match.matched) return "UYGUN DEGIL / RISKLI";

  if (!hasCoreAccounting(f) || !f.hasDeclarationControls || !f.filingsRegular) return "POTANSIYEL";
  if ((support.taxType === "KDV" || support.id.includes("kdv")) && (!f.hasKdvListsAndDeclarations || f.hasSpecialPrinciplesRisk)) {
    return "POTANSIYEL";
  }
  if (f.hasTaxDebt || f.hasSgkDebt || f.hasTaxRiskHistory) return "POTANSIYEL";
  return "UYGUN";
};

const riskNotes = (support: VergiselSupportDefinition, f: VergiselTesvikFormState): string[] => {
  const notes = [sourceWarningText, finalSuitabilityWarning];
  if (f.hasTaxDebt || f.hasSgkDebt) notes.push("Vergi/SGK borcu bazi uygulamalarda risk ve gecikme olusturabilir.");
  if (f.hasTaxRiskHistory || f.hasSpecialPrinciplesRisk) notes.push("Ozel esas/vergi incelemesi gecmisi KDV iade ve istisna sureclerini zorlastirabilir.");
  if (f.hasPreCertificateExpenses || f.contractSignedBeforeVrhib) notes.push("Belge oncesi islem/harcama kaynakli vergi ziyai ve ceza riski olabilir.");
  if (support.id === "genc-girisimci-kazanc-istisnasi") notes.push("2026 sonrasi Bag-Kur prim tesviki durumu ayrica guncel olarak kontrol edilmelidir.");
  if (f.hasAnotherExceptionSameTransaction) notes.push("Ayni gelir/giderde birden fazla istisna uygulamasi cifte avantaj riski dogurabilir.");
  return notes;
};

const isKdvOpportunity = (id: string, taxType: VergiTuru): boolean =>
  taxType === "KDV" || id.includes("kdv") || id === "mal-ihracati-kdv-istisna-iade";

const isPayrollOpportunity = (id: string): boolean =>
  id === "yan-hak-bordro-optimizasyonu" || id === "teknokent-personel-stopaj-damga" || id === "arge-stopaj-5746";

export const evaluateVergiselTesvikSupports = (
  form: VergiselTesvikFormState,
  selection: VergiselNeedSelection,
): VergiselSupportResult[] => {
  return vergiselTesvikSupports.map((support) => {
    const match = matchSupport(support, form, selection);
    const status = resolveStatus(support, form, match);

    const whyEligible = status !== "UYGUN DEGIL / RISKLI" && match.matched ? [...match.positive] : [];
    const whyNotEligible = status === "UYGUN DEGIL / RISKLI" ? [...match.negative] : [];
    const howToBecomeEligible = status === "UYGUN DEGIL / RISKLI" ? [...match.actions] : [];

    if (!match.relevant) {
      whyNotEligible.push("Secili ihtiyac tiplerinde bu vergisel alan birincil oncelikte degil.");
      howToBecomeEligible.push("Ihtiyac tipi seciminden ilgili baslik aktif edilerek analiz yenilenmelidir.");
    }

    if (status === "POTANSIYEL") {
      whyNotEligible.push("Belge/muhasebe/beyanname kontrolu tamamlanmadan kesin uygulama onerilmez.");
      howToBecomeEligible.push("Belge seti, muhasebe ayrimi ve donemsel kontrol mekanizmasi guclendirilmelidir.");
    }

    if (status === "UYGUN DEGIL / RISKLI" && whyNotEligible.length === 0) {
      whyNotEligible.push(riskText);
    }

    const howToApply =
      status === "UYGUN"
        ? [
            "Mukellef ve faaliyet on uygunluk kriterlerini sagliyor.",
            "Ilgili belge/ruhsat/proje onayi kontrol edilir.",
            "Gelir, gider, personel ve harcamalar muhasebede ayri izlenir.",
            "Beyanname, bordro, KDV iade dosyasi veya DYS/E-TUYS sureci ilgili mevzuata gore yurutulur.",
            "Uygulama oncesinde SMMM/YMM ve guncel mevzuat kontrolu yapilir.",
          ]
        : status === "POTANSIYEL"
          ? [potentialText, ...commonHowToApply]
          : [];

    const nextAction =
      status === "UYGUN"
        ? "Uygulamayi donemsel kontrol listesiyle birlikte SMMM/YMM denetiminde hayata alin."
        : status === "POTANSIYEL"
          ? "Eksik belge ve muhasebe ayrismasini tamamlayip mevzuat kontrolu ile tekrar degerlendirin."
          : "Mukellef turu, faaliyet kapsami ve belge yapisini ilgili mevzuata uygun sekilde yeniden tasarlayin.";

    const requiredDocuments = Array.from(new Set([...productSpecificDocuments(support.id), ...commonRequiredDocuments]));

    return {
      id: support.id,
      supportName: support.supportName,
      status,
      legalBasis: support.legalBasis,
      taxType: support.taxType,
      beneficiaryProfile: support.beneficiaryProfile,
      suitableActivity: support.suitableActivity,
      taxAdvantage: support.taxAdvantage,
      whyEligible,
      howToApply,
      whyNotEligible,
      howToBecomeEligible,
      requiredDocuments,
      applicationChannel: support.applicationChannel,
      nextAction,
      riskNote: riskNotes(support, form).join(" "),
      sourceWarning: sourceWarningText,
    };
  });
};

export const summarizeVergiselTesvikResults = (
  results: VergiselSupportResult[],
  form: VergiselTesvikFormState,
): VergiselSummary => {
  const uygunCount = results.filter((item) => item.status === "UYGUN").length;
  const potansiyelCount = results.filter((item) => item.status === "POTANSIYEL").length;
  const riskliCount = results.filter((item) => item.status === "UYGUN DEGIL / RISKLI").length;
  const isOpportunity = (status: VergiselSupportStatus) => status === "UYGUN" || status === "POTANSIYEL";

  const kdvOpportunityCount = results.filter((item) => isOpportunity(item.status) && isKdvOpportunity(item.id, item.taxType)).length;
  const payrollOptimizationCount = results.filter((item) => isOpportunity(item.status) && isPayrollOpportunity(item.id)).length;

  return {
    uygunCount,
    potansiyelCount,
    riskliCount,
    kdvOpportunityCount,
    payrollOptimizationCount,
    missingDocumentCount: calculateMissingDocumentCount(form),
    vergiselUygunlukScore: calculateVergiselUygunlukScore(form),
    belgeMuhasebeHazirlikScore: calculateBelgeMuhasebeHazirlikScore(form),
  };
};


