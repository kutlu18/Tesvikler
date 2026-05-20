import { evaluateSgkTesvikleri, summarizeSgkResults } from "../src/sgk/logic/evaluateSgkTesvikleri";
import { createInitialSgkFormState } from "../src/sgk/types";
import { evaluateKosgebSupports, summarizeKosgebResults } from "../src/kosgeb/logic/evaluateKosgebSupports";
import { createInitialKosgebFormState } from "../src/kosgeb/types";
import { evaluateTubitakSupports, summarizeTubitakResults } from "../src/tubitak/logic/evaluateTubitakSupports";
import { createInitialTubitakFormState } from "../src/tubitak/types";
import { evaluateYatirimTesvik, summarizeYatirimTesvik } from "../src/yatirimTesvik/logic/evaluateYatirimTesvik";
import { createInitialYatirimTesvikFormState } from "../src/yatirimTesvik/types";
import { evaluateTicaretSupports, summarizeTicaretResults } from "../src/ticaret/logic/evaluateTicaretSupports";
import { createInitialSupportSelection, createInitialTicaretFormState } from "../src/ticaret/types";
import { evaluateEximbankSupports, summarizeEximbankResults } from "../src/eximbank/logic/evaluateEximbankSupports";
import { createInitialEximbankFormState, createInitialEximbankNeedSelection } from "../src/eximbank/types";
import { evaluateKalkinmaAjansiSupports, summarizeKalkinmaAjansiResults } from "../src/kalkinmaAjansi/logic/evaluateKalkinmaAjansiSupports";
import { createInitialKalkinmaFormState, createInitialNeedSelection } from "../src/kalkinmaAjansi/types";
import { evaluateVergiselTesvikSupports, summarizeVergiselTesvikResults } from "../src/vergiselTesvik/logic/evaluateVergiselTesvikSupports";
import { createInitialVergiselNeedSelection, createInitialVergiselTesvikFormState } from "../src/vergiselTesvik/types";

type ResultStatus = "UYGUN" | "POTANSIYEL" | "RISKLI";
type TestResult = {
  id: string;
  title: string;
  status: "PASS" | "FAIL";
  expected: string;
  actual: string;
  notes?: string;
};

type GenericResult = {
  status?: string;
  durum?: string;
  id?: string;
  supportClass?: string;
  productClass?: string;
  supportName?: string;
  ad?: string;
  whyNotEligible?: string[];
  riskNote?: string;
  risk_notu?: string[];
};

const normalizeStatus = (value: string | undefined): ResultStatus => {
  const upper = String(value ?? "").toLocaleUpperCase("tr-TR");
  if (upper === "UYGUN") return "UYGUN";
  if (upper.includes("POTANS")) return "POTANSIYEL";
  return "RISKLI";
};

const getStatus = (item: GenericResult): ResultStatus => normalizeStatus(item.status ?? item.durum);
const hasUygun = (items: GenericResult[]): boolean => items.some((item) => getStatus(item) === "UYGUN");
const hasPotential = (items: GenericResult[]): boolean => items.some((item) => getStatus(item) === "POTANSIYEL");
const noUygun = (items: GenericResult[]): boolean => !hasUygun(items);
const byId = <T extends GenericResult>(items: T[], id: string): T | undefined => items.find((item) => item.id === id);
const byName = <T extends GenericResult>(items: T[], part: string): T | undefined =>
  items.find((item) => (item.supportName ?? item.ad ?? "").toLocaleLowerCase("tr-TR").includes(part.toLocaleLowerCase("tr-TR")));

const countStatuses = (items: GenericResult[]) => {
  const uygunCount = items.filter((item) => getStatus(item) === "UYGUN").length;
  const potansiyelCount = items.filter((item) => getStatus(item) === "POTANSIYEL").length;
  const riskliCount = items.length - uygunCount - potansiyelCount;
  return { uygunCount, potansiyelCount, riskliCount };
};

const assert = (id: string, title: string, ok: boolean, expected: string, actual: string, notes?: string): TestResult => ({
  id,
  title,
  status: ok ? "PASS" : "FAIL",
  expected,
  actual,
  notes,
});

const scoreInRange = (value: unknown): boolean => typeof value === "number" && value >= 0 && value <= 100;

const tests: TestResult[] = [];

{
  const form = { ...createInitialSgkFormState(), calisan_sayisi: 10 };
  const results = evaluateSgkTesvikleri(form);
  const summary = summarizeSgkResults(results);
  const counts = countStatuses(results);
  const result5510 = byName(results, "5510");
  tests.push(assert("UAT-GEN-SGK", "SGK summary counts match result cards", JSON.stringify(summary) === JSON.stringify({ ...counts, totalCount: results.length }), "Summary equals manual counts", JSON.stringify(summary)));
  tests.push(assert("UAT-SGK-001", "Temel 5510 indirimi uygun senaryo", getStatus(result5510 ?? {}) === "UYGUN", "5510 UYGUN", `${result5510?.durum}`));
}

{
  const form = { ...createInitialSgkFormState(), sgk_borcu_yok: false, bildirgeler_suresinde: false, primler_suresinde: false, calisan_sayisi: 10 };
  const result5510 = byName(evaluateSgkTesvikleri(form), "5510");
  const riskText = [...(result5510?.risk_notu ?? []), ...(result5510?.gerekce ?? [])].join(" ");
  tests.push(assert("UAT-SGK-002", "Borc ve gec bildirim risk senaryosu", getStatus(result5510 ?? {}) !== "UYGUN" && /borc|bildirge|prim/i.test(riskText), "5510 uygun degil ve risk notu borc/bildirim/prim icermeli", `${result5510?.durum}; ${riskText}`));
}

{
  const base = createInitialSgkFormState();
  const form = { ...base, calisan_sayisi: 10, yeni_ise_alim_var: true, aday_yas: 25, aday_cinsiyet: "Erkek" as const, aday_son_6_ay_issiz: true, aday_ortalama_ilave: true, aday_mesleki_belge: true, aday_iskur_kayitli: true };
  const result6111 = byName(evaluateSgkTesvikleri(form), "6111");
  const withoutCandidate = byName(evaluateSgkTesvikleri({ ...form, yeni_ise_alim_var: false }), "6111");
  tests.push(assert("UAT-SGK-003", "Yeni aday kosullari 6111 sonucunu etkiler", getStatus(result6111 ?? {}) === "UYGUN" && getStatus(withoutCandidate ?? {}) !== "UYGUN", "Aday varken UYGUN, aday yokken uygun degil", `${result6111?.durum} -> ${withoutCandidate?.durum}`));
}

{
  const form = { ...createInitialKosgebFormState(), isKosgebRegistered: true, isKobiDeclarationCurrent: true, plansMachineEquipment: true, plansSoftware: true, projectBudget: 500000 };
  const results = evaluateKosgebSupports(form);
  const summary = summarizeKosgebResults(results);
  const counts = countStatuses(results);
  tests.push(assert("UAT-GEN-KOS", "KOSGEB summary counts match result cards", summary.uygunCount === counts.uygunCount && summary.potansiyelCount === counts.potansiyelCount && summary.riskliCount === counts.riskliCount, "Summary equals manual counts", JSON.stringify(summary)));
  tests.push(assert("UAT-KOS-001", "KOBI ve belge altyapisi guclu", hasUygun(results), "En az bir UYGUN destek", JSON.stringify(counts)));
}

{
  const results = evaluateKosgebSupports({ ...createInitialKosgebFormState(), isKobi: false, isKosgebRegistered: true, isKobiDeclarationCurrent: true, plansMachineEquipment: true });
  tests.push(assert("UAT-KOS-002", "KOBI degil", noUygun(results), "KOBI odakli destekler uygun olmamali", JSON.stringify(countStatuses(results))));
}

{
  const result = byId(evaluateKosgebSupports({ ...createInitialKosgebFormState(), isKosgebRegistered: true, isKobiDeclarationCurrent: true, wantsBusinessDevelopmentInvestment: true }), "kapasite-kobigel-cagri");
  tests.push(assert("UAT-KOS-003", "Cagriya bagli destek kesin uygun olmamali", getStatus(result ?? {}) === "POTANSIYEL", "Kapasite/KOBIGEL POTANSIYEL", `${result?.status}`));
}

{
  const form = { ...createInitialTubitakFormState(), hasProdisRegistration: true, hasPreRegistrationDocs: true, hasMachineryExpense: true, hasMaterialExpense: true, projectBudget: 1500000 };
  const results = evaluateTubitakSupports(form);
  const summary = summarizeTubitakResults(results, form);
  const counts = countStatuses(results);
  tests.push(assert("UAT-GEN-TUB", "TUBITAK summary counts and score range", summary.uygunCount === counts.uygunCount && summary.potansiyelCount === counts.potansiyelCount && summary.riskliCount === counts.riskliCount && scoreInRange(summary.argeScore), "Summary tutarli, skor 0-100", JSON.stringify(summary)));
  tests.push(assert("UAT-TUB-001", "Guclu Ar-Ge projesi", summary.argeScore >= 70 && hasUygun(results), "Skor >= 70 ve en az bir UYGUN", JSON.stringify(summary)));
}

{
  const form = { ...createInitialTubitakFormState(), hasTechnicalUncertainty: false, hasOriginalValue: false, hasPrototypeMvpPilotDemo: false, hasCommercializationPlan: false, isRoutineCommercialProject: true, hasNewProductDevelopment: false };
  const results = evaluateTubitakSupports(form);
  const summary = summarizeTubitakResults(results, form);
  tests.push(assert("UAT-TUB-002", "Rutin ticari proje", noUygun(results) && summary.argeScore <= 39, "UYGUN yok, skor 0-39", JSON.stringify(summary)));
}

{
  const form = { ...createInitialTubitakFormState(), hasProdisRegistration: false, hasPreRegistrationDocs: false, hasMachineryExpense: true, projectBudget: 1000000 };
  const result1507 = byId(evaluateTubitakSupports(form), "1507");
  tests.push(assert("UAT-TUB-003", "Idari eksik uygun sonucu potansiyele dusurur", getStatus(result1507 ?? {}) === "POTANSIYEL", "1507 POTANSIYEL", `${result1507?.status}`));
}

{
  const form = { ...createInitialYatirimTesvikFormState(), hasETuysAuthorization: true, isInvestmentLocationKnown: true, investmentCity: "Ankara", investmentDistrict: "Sincan", investmentSubject: "Yuksek teknoloji otomasyon uretim hatti", investmentAmount: 80000000, meetsMinimumFixedInvestment: true, hasMachineryList: true, hasProformaInvoices: true, hasFinancialFeasibility: true, hasCapacityReport: true, regionalCategory: "5-6 dezavantajli", createsNewEmployment: true, expectedNewEmploymentCount: 20 };
  const results = evaluateYatirimTesvik(form);
  const summary = summarizeYatirimTesvik(results, form);
  const counts = countStatuses(results);
  tests.push(assert("UAT-GEN-YAT", "Yatirim Tesvik summary counts and score range", summary.uygunCount === counts.uygunCount && summary.potansiyelCount === counts.potansiyelCount && summary.riskliCount === counts.riskliCount && scoreInRange(summary.suitabilityScore.score) && scoreInRange(summary.etuysReadiness.score), "Summary tutarli, skorlar 0-100", JSON.stringify(summary)));
  tests.push(assert("UAT-YAT-001", "Guclu basvuru adayi", summary.suitabilityScore.score >= 70 && hasUygun(results), "Skor >= 70 ve en az bir UYGUN", JSON.stringify(summary)));
}

{
  const form = { ...createInitialYatirimTesvikFormState(), investmentStarted: true, hasPreCertificateExpenses: true, invoicesIssued: true, importProcessesStarted: true, spendingTiming: "BelgeOncesi" as const };
  const summary = summarizeYatirimTesvik(evaluateYatirimTesvik(form), form);
  tests.push(assert("UAT-YAT-002", "Belge oncesi harcama riski", summary.preCertificateSpendingRisk === "Yüksek", "Risk Yuksek", summary.preCertificateSpendingRisk));
}

{
  const form = { ...createInitialYatirimTesvikFormState(), hasETuysAuthorization: false, isInvestmentLocationKnown: true, investmentCity: "Ankara", investmentDistrict: "Sincan", investmentSubject: "Makine uretim hatti", investmentAmount: 10000000, meetsMinimumFixedInvestment: true, hasMachineryList: true, hasProformaInvoices: true, hasFinancialFeasibility: true, regionalCategory: "3-4" };
  const results = evaluateYatirimTesvik(form);
  tests.push(assert("UAT-YAT-003", "E-TUYS yok", noUygun(results) && hasPotential(results), "UYGUN yok, POTANSIYEL var", JSON.stringify(countStatuses(results))));
}

{
  const selection = { ...createInitialSupportSelection(), eihracat: false, hizmet: false };
  const form = { ...createInitialTicaretFormState(), isExporterUnionMember: true, hasDys: true, hasKep: true, hasESignOrFinancialSeal: true, currentlyExports: true, exportedLast12Months: true, annualExportBand: "1M_10M" as const, exportCountryCount: 3, hasTargetMarkets: true, hasExportStrategyPlan: true, hasForeignLanguageSalesAssets: true, knowsGtipNaceOrServiceCode: true, hasPhysicalProductExport: true, productsProducedInTurkey: true, needsMarketEntryCertificate: true, plansForeignPromotionAndAds: true, expenseIncurred: true, checkedPreApprovalOrOnayRequirement: true, hasInvoicesDecotsContractsAndProof: true, paymentsFromCompanyBankAccount: true, canDocumentCollectionsViaBank: true, expenseTargetsForeignMarket: true, withinApplicationTimeLimit: true, knowsApplicationAuthority: true, knowsDysKepEsignSubmissionPath: true, hasDigitalDocumentArchive: true };
  const results = evaluateTicaretSupports(form, selection);
  const summary = summarizeTicaretResults(results, form);
  const counts = countStatuses(results);
  tests.push(assert("UAT-GEN-TIC", "Ticaret summary counts and score range", summary.uygunCount === counts.uygunCount && summary.potansiyelCount === counts.potansiyelCount && summary.riskliCount === counts.riskliCount && scoreInRange(summary.dysReadiness.score) && scoreInRange(summary.exportSuitability.score), "Summary tutarli, skorlar 0-100", JSON.stringify(summary)));
  tests.push(assert("UAT-TIC-001", "Mal ihracati guclu aday", hasUygun(results), "MAL seciminde en az bir UYGUN", JSON.stringify(counts)));
  tests.push(assert("UAT-TIC-003", "Secim bazli soru/sonuc sinifi", results.every((item) => item.supportClass === "MAL"), "Sadece MAL sonuc uretmeli", results.map((item) => item.supportClass).join(",")));
}

{
  const form = { ...createInitialTicaretFormState(), notFundedByOtherPublicSupport: false, isExporterUnionMember: true, hasDys: true, hasKep: true, hasESignOrFinancialSeal: true, hasPhysicalProductExport: true, expenseIncurred: true, checkedPreApprovalOrOnayRequirement: true, hasInvoicesDecotsContractsAndProof: true, paymentsFromCompanyBankAccount: true, expenseTargetsForeignMarket: true, withinApplicationTimeLimit: true };
  const results = evaluateTicaretSupports(form, { mal: true, eihracat: false, hizmet: false });
  tests.push(assert("UAT-TIC-002", "Mukerrer destek riski", noUygun(results), "Mukerrer kamu destegi varken UYGUN olmamali", JSON.stringify(countStatuses(results))));
}

{
  const form = createInitialEximbankFormState();
  const selection = createInitialEximbankNeedSelection();
  const results = evaluateEximbankSupports(form, selection);
  const summary = summarizeEximbankResults(results, form, selection);
  const counts = countStatuses(results);
  tests.push(assert("UAT-GEN-EXI", "Eximbank summary counts and score range", summary.uygunCount === counts.uygunCount && summary.potansiyelCount === counts.potansiyelCount && summary.riskliCount === counts.riskliCount && scoreInRange(summary.finansmanHazirlikScore.score) && scoreInRange(summary.ihracatFinansmanUygunlukScore.score), "Summary tutarli, skorlar 0-100", JSON.stringify(summary)));
  tests.push(assert("UAT-EXI-001", "Ihracat kredisi guclu aday", hasUygun(results), "En az bir UYGUN finansman araci", JSON.stringify(counts)));
}

{
  const form = { ...createInitialEximbankFormState(), hasDeferredSales: true, knowsBuyerAndCountryRisk: true, hasReceivableAgingReport: true, plansNewCountryOrBuyerSales: true, wantsCollectionRiskInsurance: true, hasBuyerListAndAging: true };
  const selection = { ...createInitialEximbankNeedSelection(), sevkOncesiFinansman: false, ihracataHazirlik: false, isletmeSermayesi: false, yatirimFinansmani: false, igeKefaleti: false, yesilFinansman: false, hizmetIhracatiFinansmani: false };
  const results = evaluateEximbankSupports(form, selection);
  tests.push(assert("UAT-EXI-002", "Alacak sigortasi adayi", results.length > 0 && results.every((item) => item.productClass === "SIGORTA" || item.productClass === "GARANTI") && hasUygun(results), "Krediyle karismadan sigorta/garanti risk yonetimi sonucu", results.map((item) => `${item.productClass}:${item.status}`).join(",")));
}

{
  const form = { ...createInitialEximbankFormState(), isExporter: false, isManufacturerExporter: false, isExportOrientedManufacturer: false, hasForeignCurrencyService: false, exportedLast12Months: false, hasExportOrderOrContract: false };
  const results = evaluateEximbankSupports(form, createInitialEximbankNeedSelection());
  tests.push(assert("UAT-EXI-003", "Ihracatci profili yok", noUygun(results), "Ihracatci profili yokken UYGUN olmamali", JSON.stringify(countStatuses(results))));
}

{
  const form = { ...createInitialKalkinmaFormState(), agencyRegionKnown: true, applicantCity: "Ankara", projectCity: "Ankara", projectDistrict: "Cankaya", projectInAgencyRegion: true, fitsRegionalPlanPriorities: true, fitsCityPrioritySectors: true, hasLocalDevelopmentImpact: true, projectSubject: "Dijital donusum yatirimi", isCapacityIncrease: true, isDigitalTransformation: true, projectBudget: 2500000, hasProjectDraftFile: true, hasProjectOutputsAndIndicators: true, canProvideCoFinance: true, coFinanceBudgetAllocated: true, hasOpenFinancialCall: true, callOpenToPrivateSector: true, fitsProgramPriorities: true, budgetWithinCallLimits: true, coFinanceRateMet: true, readyForKaysSubmission: true, hasKaysUserAccount: true, kaysAuthorizedSignatoryReady: true, hasSignatureAuthorityDocs: true, hasTaxCertificate: true, hasTradeRegistryGazette: true, hasActivityCertificate: true, hasFinancialStatements: true, hasApplicationFormDraft: true, hasProjectBudgetDraft: true, hasCoFinanceDeclaration: true, hasProjectTimeline: true, reviewedOpenCallGuideline: true, hasProformaInvoices: true, hasTechnicalSpecifications: true };
  const selection = { ...createInitialNeedSelection(), teknikDestek: false, fizibilite: false, faizsizKredi: false, faizKarPayi: false, gudumluProje: false, sosyalGelisme: false, yerelUrun: false, dijitalDonusum: false, yesilDonusum: false };
  const results = evaluateKalkinmaAjansiSupports(form, selection);
  const summary = summarizeKalkinmaAjansiResults(results, form);
  const counts = countStatuses(results);
  tests.push(assert("UAT-GEN-KAL", "Kalkinma summary counts and score range", summary.uygunCount === counts.uygunCount && summary.potansiyelCount === counts.potansiyelCount && summary.riskliCount === counts.riskliCount && scoreInRange(summary.kaysReadinessScore.score) && scoreInRange(summary.kalkinmaAjansiUygunlukScore.score), "Summary tutarli, skorlar 0-100", JSON.stringify(summary)));
  tests.push(assert("UAT-KAL-001", "Mali destek guclu aday", hasUygun(results) || hasPotential(results), "UYGUN veya guclu POTANSIYEL", JSON.stringify(counts)));
}

{
  const form = { ...createInitialKalkinmaFormState(), projectSubject: "Bolgesel etkili proje", fitsRegionalPlanPriorities: true, hasOpenFinancialCall: false, reviewedOpenCallGuideline: false };
  const results = evaluateKalkinmaAjansiSupports(form, { ...createInitialNeedSelection(), teknikDestek: false, fizibilite: false, faizsizKredi: false, faizKarPayi: false, gudumluProje: false, sosyalGelisme: false, yerelUrun: false, dijitalDonusum: false, yesilDonusum: false });
  tests.push(assert("UAT-KAL-002", "Cagri yok / rehber incelenmemis", noUygun(results), "Kesin UYGUN verilmemeli", JSON.stringify(countStatuses(results))));
}

{
  const form = { ...createInitialKalkinmaFormState(), financedByOtherPublicSupport: true, projectSubject: "Makine yatirimi", hasOpenFinancialCall: true, fitsProgramPriorities: true };
  const results = evaluateKalkinmaAjansiSupports(form, createInitialNeedSelection());
  const hasRiskText = results.some((item) => [...item.whyNotEligible, item.riskNote].join(" ").toLocaleLowerCase("tr-TR").includes("finansman"));
  tests.push(assert("UAT-KAL-003", "Cifte finansman riski", hasRiskText, "Risk/gerekce metni finansman riskini belirtmeli", results.map((item) => item.riskNote).join(" | ")));
}

{
  const form = { ...createInitialVergiselTesvikFormState(), mukellefType: "TEKNOKENT_FIRMASI" as const, hasTeknokentActivity: true, hasTeknokentContract: true, hasTeknokentActivityDoc: true, hasTeknokentProjectApproval: true, hasSoftwareArgeDesignProject: true, incomeOnlyFromTeknokentProject: true, tracksInOutRegionActivities: true, classifiesArgeSupportPersonnel: true, tracksInOutRegionWorkTime: true, tracksRemoteWorkAndClassification: true, evaluatesTeknokentKdvException: true, separatesProjectIncomeInAccounting: true, hasTeknokentYmmReporting: true, hasSeparateAccountingAccounts: true, hasProjectCostCenters: true, hasPersonnelTimeRecords: true, hasInvoiceBankContractFiles: true, hasDeclarationControls: true, hasKdvListsAndDeclarations: true };
  const selection = { ...createInitialVergiselNeedSelection(), arge5746: false, gencGirisimci: false, ytbVergiAvantaj: false, serbestBolge: false, ihracatHizmetIhracati: false, vrhib: false, kdvIstisnaIade: false, osb: false, lisansliDepoculuk: false, bordroOptimizasyon: false };
  const results = evaluateVergiselTesvikSupports(form, selection);
  const summary = summarizeVergiselTesvikResults(results, form);
  const counts = countStatuses(results);
  tests.push(assert("UAT-GEN-VER", "Vergisel summary counts and score range", summary.uygunCount === counts.uygunCount && summary.potansiyelCount === counts.potansiyelCount && summary.riskliCount === counts.riskliCount && scoreInRange(summary.vergiselUygunlukScore.score) && scoreInRange(summary.belgeMuhasebeHazirlikScore.score), "Summary tutarli, skorlar 0-100", JSON.stringify(summary)));
  tests.push(assert("UAT-VER-001", "Teknokent / 4691 guclu aday", hasUygun(results), "En az bir UYGUN teknokent sonucu", JSON.stringify(counts)));
}

{
  const form = { ...createInitialVergiselTesvikFormState(), hasTeknokentActivity: true, hasTeknokentProjectApproval: false, hasSeparateAccountingAccounts: false };
  const results = evaluateVergiselTesvikSupports(form, { ...createInitialVergiselNeedSelection(), arge5746: false, gencGirisimci: false, ytbVergiAvantaj: false, serbestBolge: false, ihracatHizmetIhracati: false, vrhib: false, kdvIstisnaIade: false, osb: false, lisansliDepoculuk: false, bordroOptimizasyon: false });
  tests.push(assert("UAT-VER-002", "Belge/proje onayi yok", noUygun(results), "UYGUN verilmemeli", JSON.stringify(countStatuses(results))));
}

{
  const form = { ...createInitialVergiselTesvikFormState(), hasTaxDebt: true, hasSgkDebt: true, hasTaxRiskHistory: true, hasTeknokentActivity: true, hasTeknokentProjectApproval: true };
  const results = evaluateVergiselTesvikSupports(form, createInitialVergiselNeedSelection());
  const hasRiskText = results.some((item) => [...item.whyNotEligible, item.riskNote].join(" ").toLocaleLowerCase("tr-TR").match(/borc|risk|ymm|smmm/));
  tests.push(assert("UAT-VER-003", "Borc ve vergi risk gecmisi", hasRiskText, "Borc/risk/SMMM-YMM aksiyonu gorunmeli", results.map((item) => item.riskNote).join(" | ")));
}

const passed = tests.filter((test) => test.status === "PASS").length;
const failed = tests.length - passed;
const report = {
  runAt: new Date().toISOString(),
  total: tests.length,
  passed,
  failed,
  tests,
};

console.log(JSON.stringify(report, null, 2));

if (failed > 0) {
  process.exitCode = 1;
}
