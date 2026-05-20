export type EximbankSupportStatus = "UYGUN" | "POTANSIYEL" | "UYGUN DEGIL / RISKLI";

export type EximbankProductClass = "KREDI" | "SIGORTA" | "KEFALET" | "GARANTI" | "YESIL_FINANSMAN";

export type EximbankCompanyType = "Sahis" | "Limited" | "Anonim" | "Kooperatif" | "SerbestBolgeKullanicisi" | "Diger";

export type EximbankCreditType = "IsletmeSermayesi" | "Yatirim" | "IhracatFinansmani" | "Belirsiz";

export type EximbankNeedType =
  | "sevkOncesiFinansman"
  | "ihracataHazirlik"
  | "isletmeSermayesi"
  | "yatirimFinansmani"
  | "alacakSigortasi"
  | "igeKefaleti"
  | "yesilFinansman"
  | "hizmetIhracatiFinansmani";

export interface EximbankNeedSelection {
  sevkOncesiFinansman: boolean;
  ihracataHazirlik: boolean;
  isletmeSermayesi: boolean;
  yatirimFinansmani: boolean;
  alacakSigortasi: boolean;
  igeKefaleti: boolean;
  yesilFinansman: boolean;
  hizmetIhracatiFinansmani: boolean;
}

export interface EximbankFormState {
  isTurkeyResident: boolean;
  companyType: EximbankCompanyType;
  isKobi: boolean;
  isLargeEnterprise: boolean;
  isExporter: boolean;
  isManufacturerExporter: boolean;
  isExportOrientedManufacturer: boolean;
  hasForeignCurrencyService: boolean;
  isExporterUnionMember: boolean;
  exportedLast12Months: boolean;
  usedEximbankCreditBefore: boolean;
  usedEximbankInsuranceBefore: boolean;
  usedIgeGuaranteeBefore: boolean;
  hasCreditRisk: boolean;
  hasTaxOrSgkDebt: boolean;
  hasCurrentFinancialStatements: boolean;
  hasIndependentAuditOrTrialBalance: boolean;

  last12MonthExportAmount: number;
  targetAnnualExportAmount: number;
  exportCountryCount: number;
  targetCountries: string;
  hasExportOrderOrContract: boolean;
  hasProformaOrPurchaseOrder: boolean;
  hasExportDeclarations: boolean;
  collectsThroughBankingChannel: boolean;
  hasFxServiceInvoices: boolean;
  canProvideExportCommitment: boolean;
  hasTurkishOriginGoods: boolean;
  hasDahildeIsleme: boolean;
  hasDeferredSales: boolean;
  deferredSalesMaturityDays: number;
  knowsBuyerAndCountryRisk: boolean;

  needsRawMaterialOrStockFinance: boolean;
  needsPreShipmentCash: boolean;
  needsWorkingCapitalExpenseFinance: boolean;
  needsUtilityPersonnelExpenseFinance: boolean;
  needsExportPreparationFinance: boolean;
  hasOrderButCashGap: boolean;
  isSuitableForIntermediaryBankCredit: boolean;
  needsGuaranteeOrCollateralLetter: boolean;

  hasExportOrientedInvestment: boolean;
  investmentImprovesExportCapacity: boolean;
  hasInvestmentExpenseDocuments: boolean;
  hasInvestmentIncentiveCertificate: boolean;
  investmentIncentiveHasInterestSupport: boolean;
  hasNewMarketOrProductProject: boolean;
  needsLongTermFinanceOver12Months: boolean;
  needsOverseasProjectOrUnitFinance: boolean;
  evaluatesLeasingOrBankCredit: boolean;

  buyerPaymentPerformanceUnknown: boolean;
  plansNewCountryOrBuyerSales: boolean;
  hasPoliticalCommercialCollectionRisk: boolean;
  wantsCollectionRiskInsurance: boolean;
  hasOpenAccountSales: boolean;
  sellsWithoutLcOrBankGuarantee: boolean;
  needsBuyerOrCountryLimit: boolean;
  hasReceivableAgingReport: boolean;

  hasCollateralAccessProblem: boolean;
  bankCreditLimitInsufficient: boolean;
  wantsIgeGuarantee: boolean;
  hasKosgebDatabaseRegistration: boolean;
  hasBankingRelationshipHistory: boolean;
  hasEimzaOrMobileSign: boolean;
  requestedCreditTypeForGuarantee: EximbankCreditType;

  exportsToEu: boolean;
  hasCbamRisk: boolean;
  hasEnergyEfficiencyInvestment: boolean;
  hasGreenTransformationProject: boolean;
  hasRenewableEnergyInvestment: boolean;
  hasSustainabilityRoadmap: boolean;
  greenInvestmentLinkedToExportCompetitiveness: boolean;
  hasTechnicalProjectAndExpensePlan: boolean;

  hasTaxCertificate: boolean;
  hasTradeRegistryGazette: boolean;
  hasSignatureCircular: boolean;
  hasActivityCertificate: boolean;
  hasCurrentTrialBalance: boolean;
  hasLast2to3YearFinancials: boolean;
  hasCorporateTaxReturns: boolean;
  hasExportDeclarationsReady: boolean;
  hasSalesContractsAndOrders: boolean;
  hasInvoicesAndPaymentRecords: boolean;
  canPrepareExportCommitmentDocuments: boolean;
  hasExpenseDocuments: boolean;
  canPrepareCreditRequestForm: boolean;
  hasBuyerListAndAging: boolean;
  hasForeignBuyerInformation: boolean;
  hasCollateralDocuments: boolean;
  hasIgeKosgebEimzaDocuments: boolean;
  hasSustainabilityReports: boolean;
  knowsApplicationChannel: boolean;
  prefersParticipationFinance: boolean;
}

export interface EximbankSupportDefinition {
  id: string;
  supportName: string;
  institution: string;
  productClass: EximbankProductClass;
  applicantProfile: string;
  suitableNeed: string;
  financeSubject: string;
  applicationChannel: string;
}

export interface EximbankSupportResult {
  id: string;
  supportName: string;
  status: EximbankSupportStatus;
  institution: string;
  productClass: EximbankProductClass;
  applicantProfile: string;
  suitableNeed: string;
  financeSubject: string;
  whyEligible: string[];
  howToGet: string[];
  whyNotEligible: string[];
  howToBecomeEligible: string[];
  requiredDocuments: string[];
  applicationChannel: string;
  nextAction: string;
  riskNote: string;
  sourceWarning: string;
}

export interface EximbankScoreInfo {
  score: number;
  comment: string;
}

export interface EximbankSummary {
  uygunCount: number;
  potansiyelCount: number;
  riskliCount: number;
  krediOpportunityCount: number;
  sigortaKefaletOpportunityCount: number;
  missingDocumentCount: number;
  finansmanHazirlikScore: EximbankScoreInfo;
  ihracatFinansmanUygunlukScore: EximbankScoreInfo;
}

export const createInitialEximbankNeedSelection = (): EximbankNeedSelection => ({
  sevkOncesiFinansman: true,
  ihracataHazirlik: true,
  isletmeSermayesi: true,
  yatirimFinansmani: true,
  alacakSigortasi: true,
  igeKefaleti: true,
  yesilFinansman: true,
  hizmetIhracatiFinansmani: true,
});

export const createInitialEximbankFormState = (): EximbankFormState => ({
  isTurkeyResident: true,
  companyType: "Limited",
  isKobi: true,
  isLargeEnterprise: false,
  isExporter: true,
  isManufacturerExporter: true,
  isExportOrientedManufacturer: true,
  hasForeignCurrencyService: false,
  isExporterUnionMember: true,
  exportedLast12Months: true,
  usedEximbankCreditBefore: false,
  usedEximbankInsuranceBefore: false,
  usedIgeGuaranteeBefore: false,
  hasCreditRisk: false,
  hasTaxOrSgkDebt: false,
  hasCurrentFinancialStatements: true,
  hasIndependentAuditOrTrialBalance: true,

  last12MonthExportAmount: 1000000,
  targetAnnualExportAmount: 1500000,
  exportCountryCount: 2,
  targetCountries: "",
  hasExportOrderOrContract: true,
  hasProformaOrPurchaseOrder: true,
  hasExportDeclarations: true,
  collectsThroughBankingChannel: true,
  hasFxServiceInvoices: false,
  canProvideExportCommitment: true,
  hasTurkishOriginGoods: true,
  hasDahildeIsleme: false,
  hasDeferredSales: true,
  deferredSalesMaturityDays: 90,
  knowsBuyerAndCountryRisk: true,

  needsRawMaterialOrStockFinance: true,
  needsPreShipmentCash: true,
  needsWorkingCapitalExpenseFinance: true,
  needsUtilityPersonnelExpenseFinance: false,
  needsExportPreparationFinance: false,
  hasOrderButCashGap: true,
  isSuitableForIntermediaryBankCredit: true,
  needsGuaranteeOrCollateralLetter: false,

  hasExportOrientedInvestment: false,
  investmentImprovesExportCapacity: false,
  hasInvestmentExpenseDocuments: false,
  hasInvestmentIncentiveCertificate: false,
  investmentIncentiveHasInterestSupport: false,
  hasNewMarketOrProductProject: false,
  needsLongTermFinanceOver12Months: false,
  needsOverseasProjectOrUnitFinance: false,
  evaluatesLeasingOrBankCredit: false,

  buyerPaymentPerformanceUnknown: false,
  plansNewCountryOrBuyerSales: false,
  hasPoliticalCommercialCollectionRisk: false,
  wantsCollectionRiskInsurance: false,
  hasOpenAccountSales: false,
  sellsWithoutLcOrBankGuarantee: false,
  needsBuyerOrCountryLimit: false,
  hasReceivableAgingReport: false,

  hasCollateralAccessProblem: false,
  bankCreditLimitInsufficient: false,
  wantsIgeGuarantee: false,
  hasKosgebDatabaseRegistration: false,
  hasBankingRelationshipHistory: true,
  hasEimzaOrMobileSign: true,
  requestedCreditTypeForGuarantee: "Belirsiz",

  exportsToEu: false,
  hasCbamRisk: false,
  hasEnergyEfficiencyInvestment: false,
  hasGreenTransformationProject: false,
  hasRenewableEnergyInvestment: false,
  hasSustainabilityRoadmap: false,
  greenInvestmentLinkedToExportCompetitiveness: false,
  hasTechnicalProjectAndExpensePlan: false,

  hasTaxCertificate: true,
  hasTradeRegistryGazette: true,
  hasSignatureCircular: true,
  hasActivityCertificate: true,
  hasCurrentTrialBalance: true,
  hasLast2to3YearFinancials: true,
  hasCorporateTaxReturns: true,
  hasExportDeclarationsReady: true,
  hasSalesContractsAndOrders: true,
  hasInvoicesAndPaymentRecords: true,
  canPrepareExportCommitmentDocuments: true,
  hasExpenseDocuments: true,
  canPrepareCreditRequestForm: true,
  hasBuyerListAndAging: false,
  hasForeignBuyerInformation: true,
  hasCollateralDocuments: false,
  hasIgeKosgebEimzaDocuments: false,
  hasSustainabilityReports: false,
  knowsApplicationChannel: true,
  prefersParticipationFinance: false,
});
