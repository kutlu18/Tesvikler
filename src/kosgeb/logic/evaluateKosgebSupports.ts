import { kosgebSupports } from "../data/kosgebSupports";
import {
  ProjectSubjectAnalysis,
  getStoredProjectSubjectAnalysis,
  hasProjectSubjectCategory,
} from "../../core/analysis/projectSubjectAnalysis";
import {
  KosgebEvaluationSummary,
  KosgebFormState,
  KosgebSupportResult,
  KosgebSupportStatus,
} from "../types";

interface ThemeCheck {
  matched: boolean;
  reasons: string[];
  missing: string[];
  actions: string[];
}

const projectSubjectCanPromoteKosgeb = (analysis: ProjectSubjectAnalysis, supportId: string): boolean => {
  switch (supportId) {
    case "dijital-donusum":
      return hasProjectSubjectCategory(analysis, "softwareSaasPlatform");
    case "yesil-sanayi":
    case "enerji-verimliligi":
      return hasProjectSubjectCategory(analysis, "greenTransformationEnergy");
    case "kapasite-kobigel-cagri":
      return hasProjectSubjectCategory(analysis, "machineryProductionAutomation");
    case "ihracat-yurtdisi-pazar":
      return hasProjectSubjectCategory(analysis, "exportEexportMarketplace");
    case "teknoloji-yenilik":
      return (
        hasProjectSubjectCategory(analysis, "ai") ||
        hasProjectSubjectCategory(analysis, "medtechHealth") ||
        hasProjectSubjectCategory(analysis, "patentInventionTechTransfer")
      );
    case "kredi-finansman":
      return hasProjectSubjectCategory(analysis, "standardPurchaseInstallation");
    default:
      return false;
  }
};

const commonHowToGetSteps = [
  "KOSGEB veri tabanı kaydı ve güncel KOBİ beyannamesi kontrol edilir.",
  "Program başvuru ekranından proje/başvuru oluşturulur.",
  "Harcama yapılmadan önce başvuru ve onay süreçleri tamamlanır.",
  "Uygun giderlere ilişkin proforma/fatura/dekont/belge seti hazırlanır."
];

const potentialHowToGet =
  "İşletme destek konusuna uygun görünüyor ancak KOSGEB kaydı, KOBİ beyannamesi, açık çağrı veya borç durumu doğrulanmadan kesin uygunluk verilemez.";

const notEligibleMessage =
  "İşletme KOBİ statüsünde olmadığı veya destek konusu yatırım/harcama bulunmadığı için uygun görünmüyor. Destekten yararlanmak için KOBİ statüsü, uygun NACE/faaliyet kodu, uygun proje konusu ve gerekli belge seti sağlanmalıdır.";

const hasBusinessDevelopmentSpend = (form: KosgebFormState): boolean =>
  form.plansMachineEquipment ||
  form.plansSoftware ||
  form.plansEmployment ||
  form.plansTrainingConsulting ||
  form.needsCertificationTestAnalysis ||
  form.plansDesignService ||
  form.plansIndustrialProperty ||
  form.plansMarketingPromotion;

const getBaseGaps = (form: KosgebFormState): { reasons: string[]; actions: string[] } => {
  const reasons: string[] = [];
  const actions: string[] = [];

  if (!form.isKobi) {
    reasons.push("İşletme KOBİ statüsünde görünmüyor.");
    actions.push("KOBİ kriterleri (çalışan sayısı, satış hasılatı, bilanço) güncel mevzuata göre kontrol edilmelidir.");
  }

  if (!form.isKosgebRegistered) {
    reasons.push("KOSGEB veri tabanı kaydı bulunmuyor.");
    actions.push("KOSGEB veri tabanı kaydı tamamlanmalıdır.");
  }

  if (!form.isKobiDeclarationCurrent) {
    reasons.push("KOBİ beyannamesi güncel değil.");
    actions.push("KOBİ beyannamesi güncellenmelidir.");
  }

  if (form.hasTaxOrSgkDebt) {
    reasons.push("Vergi/SGK borcu nedeniyle başvuru süreci riskli görünüyor.");
    actions.push("Vergi/SGK borcu ödenmeli veya yapılandırılmalıdır.");
  }

  return { reasons, actions };
};

const evaluateTheme = (id: string, form: KosgebFormState): ThemeCheck => {
  switch (id) {
    case "girisimci-destek": {
      const matched =
        form.isNewlyEstablished || form.establishedWithin3Years || form.wantsBusinessDevelopmentInvestment || hasBusinessDevelopmentSpend(form);

      return {
        matched,
        reasons: [
          "Yeni kurulum veya erken dönem işletme niteliği girişimci destekleriyle uyumludur.",
          "Makine, yazılım, personel, danışmanlık veya pazarlama gibi uygun giderler iş geliştirme desteğini destekler."
        ],
        missing: [
          "Yeni kuruluş veya iş geliştirme odaklı yatırım planı net değil.",
          "Program kapsamındaki gider kalemlerine yönelik somut bir harcama planı görünmüyor."
        ],
        actions: [
          "Kuruluş dönemi ve yatırım planı (iş planı/proje dosyası) netleştirilmelidir.",
          "Destek kapsamına giren giderler için takvimli bütçe hazırlanmalıdır."
        ]
      };
    }
    case "kredi-finansman": {
      const matched =
        form.needsCredit ||
        form.needsWorkingCapital ||
        form.needsInvestmentLoan ||
        form.seeksInterestOrProfitShareSupport ||
        form.hasCollateralProblem;

      return {
        matched,
        reasons: [
          "Kredi veya işletme sermayesi ihtiyacı finansman destekleriyle uyumludur.",
          "Faiz/kâr payı desteği arayışı programın temel amacıyla örtüşmektedir."
        ],
        missing: ["Kredi/finansman ihtiyacı beyanı olmadığı için bu destek ikinci planda kalıyor."],
        actions: ["İşletme sermayesi veya yatırım kredisi ihtiyacı rakamsal olarak netleştirilmelidir."]
      };
    }
    case "enerji-verimliligi": {
      const matched =
        form.hasHighEnergyConsumption || form.hasEnergyAudit || form.plansEfficientMotorInvestment || form.plansEnergyEfficiencyOrGreenTransformation;

      return {
        matched,
        reasons: [
          "Enerji tüketimi/verimlilik ihtiyacı enerji verimliliği desteklerine doğrudan uyumludur.",
          "Enerji etüdü, motor değişimi ve verimlilik artırıcı yatırım planı mevcut."
        ],
        missing: ["Enerji verimliliği odaklı bir yatırım veya etüt ihtiyacı görünmüyor."],
        actions: ["Enerji etüdü ve yatırım geri dönüş analizleri hazırlanmalıdır."]
      };
    }
    case "yesil-sanayi": {
      const matched =
        form.targetsCarbonReduction ||
        form.plansGesOrSustainabilityInvestment ||
        form.plansEnergyEfficiencyOrGreenTransformation ||
        form.hasGreenDealOrCbamRisk;

      return {
        matched,
        reasons: [
          "Karbon azaltımı ve sürdürülebilir üretim hedefi yeşil sanayi destekleri için güçlü bir göstergedir.",
          "AB Yeşil Mutabakatı/CBAM riski dönüşüm yatırımı ihtiyacını güçlendirir."
        ],
        missing: ["Yeşil dönüşüm, karbon azaltımı veya sürdürülebilirlik yatırımı planı netleşmemiş."],
        actions: ["Yeşil dönüşüm yol haritası ve ölçülebilir karbon/enerji hedefleri tanımlanmalıdır."]
      };
    }
    case "dijital-donusum": {
      const matched = form.plansSoftware || form.plansDigitalizationInvestment;

      return {
        matched,
        reasons: [
          "ERP/MRP/CRM, otomasyon veya yazılım yatırımı dijital dönüşüm destekleriyle uyumludur.",
          "Dijitalleşme yatırımı verimlilik ve izlenebilirlik açısından destek kapsamına girebilir."
        ],
        missing: ["Dijital dönüşüm veya yazılım yatırımı beyanı bulunmuyor."],
        actions: ["Dijital dönüşüm ihtiyaç analizi ve teknik yatırım planı hazırlanmalıdır."]
      };
    }
    case "teknoloji-yenilik": {
      const matched =
        form.developsNewProduct ||
        form.plansTechnologicalImprovement ||
        form.plansPrototypeOrMvp ||
        form.hasPatentableTechnology ||
        form.plansMassProduction ||
        form.hasDomesticProductionOrImportSubstitutionFocus;

      return {
        matched,
        reasons: [
          "Yeni ürün/prototip/teknolojik iyileştirme hedefleri teknoloji ve yenilik programlarıyla uyumludur.",
          "Patentlenebilir veya ticarileştirilebilir teknoloji potansiyeli başvuruyu güçlendirir."
        ],
        missing: ["Ar-Ge, yeni ürün, prototip veya teknoloji geliştirme faaliyeti görünmüyor."],
        actions: ["Teknoloji yol haritası ve ticarileştirme planı hazırlanmalıdır."]
      };
    }
    case "ihracat-yurtdisi-pazar": {
      const matched = form.hasExportGoal || form.plansMarketingPromotion;

      return {
        matched,
        reasons: [
          "Yurt dışı pazar hedefi/ihracat hazırlığı bu destek için doğrudan kriterdir.",
          "Tanıtım ve pazara giriş giderleri desteklenebilir harcamalara karşılık gelir."
        ],
        missing: ["Yurt dışı pazar veya ihracat hedefi tanımlanmamış."],
        actions: ["Hedef ülke, pazar giriş yöntemi ve tanıtım bütçesi netleştirilmelidir."]
      };
    }
    case "belgelendirme-test-analiz": {
      const matched = form.needsCertificationTestAnalysis;

      return {
        matched,
        reasons: [
          "CE/ISO/test/analiz ihtiyacı belgelendirme destekleriyle tam uyumludur.",
          "Ürün uygunluğu ve kalite belgeleri için planlı gider mevcut."
        ],
        missing: ["Belgelendirme, test veya analiz ihtiyacı belirtilmemiş."],
        actions: ["Gerekli belge ve test kapsamı akredite kuruluş teklifleriyle netleştirilmelidir."]
      };
    }
    case "kapasite-kobigel-cagri": {
      const matched =
        hasBusinessDevelopmentSpend(form) ||
        form.plansDigitalizationInvestment ||
        form.hasExportGoal ||
        form.wantsBusinessDevelopmentInvestment;

      return {
        matched,
        reasons: [
          "Kapasite, verimlilik, dijitalleşme veya ihracat hazırlığına dönük planlar çağrı bazlı desteklerle örtüşebilir.",
          "Ancak bu başlık yalnızca açık çağrı dönemlerinde kesinleşir."
        ],
        missing: ["Çağrı konularıyla eşleşen proje hedefi net değil."],
        actions: ["Güncel KOSGEB çağrıları düzenli kontrol edilip proje konusu çağrı metnine göre hizalanmalıdır."]
      };
    }
    case "isbirligi": {
      const matched = form.plansDesignService || form.plansMarketingPromotion || form.wantsBusinessDevelopmentInvestment;

      return {
        matched,
        reasons: [
          "Ortak üretim/tasarım/pazarlama odağı iş birliği destekleriyle uyumludur.",
          "Ölçek ekonomisi ve ortak proje yaklaşımı başvuruyu güçlendirebilir."
        ],
        missing: ["Ortak proje veya iş birliği modeli tanımlanmamış."],
        actions: ["Potansiyel KOBİ ortaklarıyla iş birliği modeli ve proje görev dağılımı oluşturulmalıdır."]
      };
    }
    default:
      return {
        matched: false,
        reasons: [],
        missing: ["Tema kontrolü tanımlanmadı."],
        actions: ["Program kriterleri ayrıca teyit edilmelidir."]
      };
  }
};

const resolveStatus = (form: KosgebFormState, matchedTheme: boolean, supportId: string): KosgebSupportStatus => {
  if (!form.isKobi) {
    return "UYGUN DEĞİL / RİSKLİ";
  }

  if (!matchedTheme) {
    return supportId === "kapasite-kobigel-cagri" ? "POTANSİYEL" : "UYGUN DEĞİL / RİSKLİ";
  }

  const hasFormalGap = !form.isKosgebRegistered || !form.isKobiDeclarationCurrent;
  const hasDebtRisk = form.hasTaxOrSgkDebt;

  if (supportId === "kapasite-kobigel-cagri") {
    return "POTANSİYEL";
  }

  if (hasFormalGap || hasDebtRisk) {
    return "POTANSİYEL";
  }

  return "UYGUN";
};

export const evaluateKosgebSupports = (form: KosgebFormState): KosgebSupportResult[] => {
  const baseGap = getBaseGaps(form);
  const projectSubjectAnalysis = getStoredProjectSubjectAnalysis();

  return kosgebSupports.map((support) => {
    const theme = evaluateTheme(support.id, form);
    let status = resolveStatus(form, theme.matched, support.id);

    const whyEligible: string[] = [];
    const whyNotEligible: string[] = [];
    const howToBecomeEligible: string[] = [];

    if (projectSubjectCanPromoteKosgeb(projectSubjectAnalysis, support.id)) {
      whyEligible.push("Proje konusu serbest metni bu KOSGEB programi ile uyumlu tematik sinyal uretiyor.");

      if (status === "UYGUN DEĞİL / RİSKLİ" && form.isKobi) {
        status = "POTANSİYEL";
        whyNotEligible.push("Proje konusu olumlu sinyal uretse de diger uygunluk ve belge kosullari ayrica tamamlanmalidir.");
        howToBecomeEligible.push("Tema uyumunu destekleyen harcama plani ve basvuru belgeleri somutlastirilmalidir.");
      }
    }

    if (theme.matched) {
      whyEligible.push(...theme.reasons);
    }

    if (status === "UYGUN") {
      whyEligible.push("KOSGEB kayıt, KOBİ beyannamesi ve borç durumu açısından kritik engel görünmüyor.");
    }

    if (status !== "UYGUN") {
      whyNotEligible.push(...theme.missing);
    }

    if (baseGap.reasons.length > 0 && status !== "UYGUN") {
      whyNotEligible.push(...baseGap.reasons);
      howToBecomeEligible.push(...baseGap.actions);
    }

    if (!theme.matched) {
      howToBecomeEligible.push(...theme.actions);
    }

    if (status === "POTANSİYEL" && support.id === "kapasite-kobigel-cagri") {
      whyNotEligible.push("Çağrı bazlı desteklerde açık dönem ve çağrı kriteri doğrulanmadan kesin uygunluk verilemez.");
      howToBecomeEligible.push("Güncel KOSGEB çağrıları kontrol edilmeli ve proje çağrı metniyle eşleştirilmelidir.");
    }

    if (support.id === "kredi-finansman" && (form.founderIsWoman || form.founderIsYoung || form.founderIsDisabledVeteranOrMartyrRelative)) {
      whyEligible.push("Kadın/genç/engelli/gazi/şehit yakını girişimci profili finansman desteğinde ilave avantaj ihtimali yaratabilir.");
    }

    if (support.id === "girisimci-destek" && form.founderHasKosgebTraining) {
      whyEligible.push("Kurucunun KOSGEB girişimcilik eğitimi almış olması başvuru hazırlığını güçlendirebilir.");
    }

    const howToGet =
      status === "UYGUN"
        ? commonHowToGetSteps
        : status === "POTANSİYEL"
          ? [potentialHowToGet, ...commonHowToGetSteps]
          : [];

    if (status === "UYGUN DEĞİL / RİSKLİ" && whyNotEligible.length === 0) {
      whyNotEligible.push(notEligibleMessage);
    }

    if (status === "UYGUN DEĞİL / RİSKLİ" && howToBecomeEligible.length === 0) {
      howToBecomeEligible.push(
        "KOBİ statüsü, uygun faaliyet kodu, proje konusu ve belge seti yeniden yapılandırılarak başvuru ön şartları sağlanmalıdır."
      );
    }

    const nextAction =
      status === "UYGUN"
        ? "Program özel başvuru dosyasını tamamlayıp harcama öncesi KOSGEB başvurusunu başlatın."
        : status === "POTANSİYEL"
          ? "Önce eksik kayıt/beyanname/borç ve çağrı uygunluğu doğrulamalarını tamamlayın, ardından başvuru dosyasını kesinleştirin."
          : "Destek konusu yatırım planını ve temel uygunluk şartlarını revize ederek yeniden ön değerlendirme yapın.";

    let riskNote =
      status === "UYGUN"
        ? "Başvuru dönemine ait güncel uygulama esasları ve harcama ön onay şartları her adımda teyit edilmelidir."
        : status === "POTANSİYEL"
          ? "Kayıt, beyanname, borç ve çağrı uygunluğu netleşmeden kesin hak kazanımı oluşmaz."
          : "Temel uygunluk eksikleri giderilmezse başvuru reddi veya destek dışı kalma riski yüksektir.";

    if (support.id === "kapasite-kobigel-cagri") {
      riskNote = "Bu destek çağrı dönemine bağlıdır; açık çağrı olmadan kesin uygunluk oluşmaz.";
    }

    return {
      id: support.id,
      supportName: support.name,
      status,
      institution: support.institution,
      supportType: support.supportType,
      beneficiaries: support.beneficiaries,
      coveredExpenses: support.coveredExpenses,
      estimatedSupportStructure: support.estimatedSupportStructure,
      whyEligible,
      howToGet,
      whyNotEligible,
      howToBecomeEligible,
      requiredDocuments: support.requiredDocuments,
      nextAction,
      riskNote
    };
  });
};

export const summarizeKosgebResults = (results: KosgebSupportResult[]): KosgebEvaluationSummary => {
  const uygunCount = results.filter((item) => item.status === "UYGUN").length;
  const potansiyelCount = results.filter((item) => item.status === "POTANSİYEL").length;
  const riskliCount = results.filter((item) => item.status === "UYGUN DEĞİL / RİSKLİ").length;

  return {
    uygunCount,
    potansiyelCount,
    riskliCount,
    totalOpportunityCount: results.length
  };
};
