export type VergiselSupportStatus = "UYGUN" | "POTANSIYEL" | "UYGUN DEGIL / RISKLI";

export type VergiTuru =
  | "GELIR_VERGISI"
  | "KURUMLAR_VERGISI"
  | "KDV"
  | "DAMGA_VERGISI"
  | "HARC"
  | "GUMRUK_VERGISI"
  | "SGK_BAGLANTILI"
  | "COKLU";

export type VergiselNeedType =
  | "teknokent4691"
  | "arge5746"
  | "gencGirisimci"
  | "ytbVergiAvantaj"
  | "serbestBolge"
  | "ihracatHizmetIhracati"
  | "vrhib"
  | "kdvIstisnaIade"
  | "osb"
  | "lisansliDepoculuk"
  | "bordroOptimizasyon";

export type MukellefType =
  | "SAHIS_ISLETMESI"
  | "LIMITED_SIRKET"
  | "ANONIM_SIRKET"
  | "SERBEST_MESLEK"
  | "KOOPERATIF"
  | "SERBEST_BOLGE_KULLANICISI"
  | "TEKNOKENT_FIRMASI"
  | "ARGE_TASARIM_MERKEZI"
  | "DIGER";

export interface VergiselNeedSelection {
  teknokent4691: boolean;
  arge5746: boolean;
  gencGirisimci: boolean;
  ytbVergiAvantaj: boolean;
  serbestBolge: boolean;
  ihracatHizmetIhracati: boolean;
  vrhib: boolean;
  kdvIstisnaIade: boolean;
  osb: boolean;
  lisansliDepoculuk: boolean;
  bordroOptimizasyon: boolean;
}

export interface VergiselTesvikFormState {
  mukellefType: MukellefType;
  isTaxPayerInTurkey: boolean;
  isIncomeTaxPayer: boolean;
  isCorporateTaxPayer: boolean;
  isKdvPayer: boolean;
  isRealProcedure: boolean;
  isNewCompany: boolean;
  establishmentDate: string;
  hasTaxDebt: boolean;
  hasSgkDebt: boolean;
  hasEdocsObligation: boolean;
  worksWithAdvisor: boolean;
  filingsRegular: boolean;
  hasTaxRiskHistory: boolean;

  hasTeknokentActivity: boolean;
  hasTeknokentContract: boolean;
  hasTeknokentActivityDoc: boolean;
  hasTeknokentProjectApproval: boolean;
  hasSoftwareArgeDesignProject: boolean;
  incomeOnlyFromTeknokentProject: boolean;
  tracksInOutRegionActivities: boolean;
  classifiesArgeSupportPersonnel: boolean;
  tracksInOutRegionWorkTime: boolean;
  tracksRemoteWorkAndClassification: boolean;
  evaluatesTeknokentKdvException: boolean;
  separatesProjectIncomeInAccounting: boolean;
  hasTeknokentYmmReporting: boolean;

  hasArgeCenterDoc: boolean;
  hasDesignCenterDoc: boolean;
  hasArgeProject: boolean;
  hasSufficientArgePersonnel: boolean;
  tracksSupportPersonnelRatio: boolean;
  hasTimesheetRecords: boolean;
  tracksArgeExpensesSeparately: boolean;
  calculatesArgeDeduction: boolean;
  appliesIncomeTaxWithholdingSupport: boolean;
  appliesStampTaxException: boolean;
  appliesSgkEmployerSupport: boolean;
  hasCustomsOrKdvExceptionPotential: boolean;
  documentsArgeQualification: boolean;

  isRealPersonEntrepreneur: boolean;
  firstIncomeTaxRegistration: boolean;
  underAgeLimitAtStart: boolean;
  notifiedStartOnTime: boolean;
  operatesOwnNameAndAccount: boolean;
  allPartnersMeetYouthCriteria: boolean;
  isBusinessTransferCase: boolean;
  usedYoungEntrepreneurBefore: boolean;
  tracksYoungEntrepreneurLimitAndDuration: boolean;
  checksBagkur2026Status: boolean;

  hasYatirimTesvikCertificate: boolean;
  hasETuysApplication: boolean;
  investmentSubjectAndLocationClear: boolean;
  hasMachineryPurchaseForKdvException: boolean;
  needsCustomsExemptionForImportedMachinery: boolean;
  hasCorporateTaxDiscountSupport: boolean;
  hasSgkEmployerSupportInYtb: boolean;
  hasInterestSupportInYtb: boolean;
  investmentCompleted: boolean;
  completionVisaDone: boolean;
  hasPreCertificateExpenses: boolean;
  machineryListMatchesDocs: boolean;
  tracksInvestmentExpensesSeparately: boolean;

  hasFreeZoneActivity: boolean;
  hasFreeZoneLicense: boolean;
  freeZoneActivityTypeProduction: boolean;
  hasProductionIncomeInFreeZone: boolean;
  hasExportSales: boolean;
  hasSalesToFreeZoneOrOtherFreeZones: boolean;
  evaluatesWageTaxExceptionInFreeZone: boolean;
  evaluatesKdvCustomsStampAdvantagesInFreeZone: boolean;
  tracksFreeZoneIncomeSeparately: boolean;
  licenseScopeMatchesIncomeTypes: boolean;

  doesGoodsExport: boolean;
  doesServiceExport: boolean;
  hasFxServiceTypes: boolean;
  hasExportInvoicesAndCustomsDocs: boolean;
  canProveServiceExportConditions: boolean;
  appliesKdvExceptionOnExports: boolean;
  receivesKdvRefund: boolean;
  evaluatesServiceExportTaxDeduction: boolean;
  collectsExportProceedsViaBank: boolean;
  needsVrhib: boolean;

  hasFxEarningTransaction: boolean;
  hasExportLinkedContracts: boolean;
  hasStampAndFeeGeneratingTransactions: boolean;
  willApplyVrhibViaDys: boolean;
  contractSignedBeforeVrhib: boolean;
  vrhibScopeMatchesAmountAndDuration: boolean;
  hasAnotherExceptionSameTransaction: boolean;

  hasSpecialKdvExceptionCases: boolean;
  hasYtbMachineryPurchaseForKdv: boolean;
  willRequestKdvRefund: boolean;
  hasReducedRateDeliveries: boolean;
  hasExportRegisteredDeliveries: boolean;
  preparesKdvRefundFile: boolean;
  needsYmmForKdvRefund: boolean;
  hasKdvListsAndDeclarations: boolean;
  hasSpecialPrinciplesRisk: boolean;

  isInOsb: boolean;
  hasOsbConstructionLandTransactions: boolean;
  transactsWithOsbLegalEntity: boolean;
  evaluatesOsbTaxExemptions: boolean;
  hasOsbYtbSubRegionAdvantage: boolean;

  hasMealBenefit: boolean;
  hasTransportBenefit: boolean;
  hasBonusSystem: boolean;
  hasPrivateHealthOrBesContribution: boolean;
  hasBoardAllowancePayment: boolean;
  hasExecutiveCompensations: boolean;
  hasBordroIncentiveConflicts: boolean;
  doesNetBrutPlanning: boolean;
  analyzesPayrollTaxAndSgkEffects: boolean;

  hasSeparateAccountingAccounts: boolean;
  hasProjectCostCenters: boolean;
  hasPersonnelTimeRecords: boolean;
  hasInvoiceBankContractFiles: boolean;
  hasDeclarationControls: boolean;
  needsYmmReportGeneral: boolean;
  needsBoardOrGeneralAssemblyDecisions: boolean;
  doesPeriodicIncentiveControls: boolean;
  hasAuthorityPermitsAndLicenses: boolean;
}

export interface VergiselSupportDefinition {
  id: string;
  supportName: string;
  legalBasis: string;
  taxType: VergiTuru;
  beneficiaryProfile: string;
  suitableActivity: string;
  taxAdvantage: string;
  applicationChannel: string;
}

export interface VergiselSupportResult {
  id: string;
  supportName: string;
  status: VergiselSupportStatus;
  legalBasis: string;
  taxType: VergiTuru;
  beneficiaryProfile: string;
  suitableActivity: string;
  taxAdvantage: string;
  whyEligible: string[];
  howToApply: string[];
  whyNotEligible: string[];
  howToBecomeEligible: string[];
  requiredDocuments: string[];
  applicationChannel: string;
  nextAction: string;
  riskNote: string;
  sourceWarning: string;
}

export interface VergiselScoreInfo {
  score: number;
  comment: string;
}

export interface VergiselSummary {
  uygunCount: number;
  potansiyelCount: number;
  riskliCount: number;
  kdvOpportunityCount: number;
  payrollOptimizationCount: number;
  missingDocumentCount: number;
  vergiselUygunlukScore: VergiselScoreInfo;
  belgeMuhasebeHazirlikScore: VergiselScoreInfo;
}

export const createInitialVergiselNeedSelection = (): VergiselNeedSelection => ({
  teknokent4691: true,
  arge5746: true,
  gencGirisimci: true,
  ytbVergiAvantaj: true,
  serbestBolge: true,
  ihracatHizmetIhracati: true,
  vrhib: true,
  kdvIstisnaIade: true,
  osb: true,
  lisansliDepoculuk: true,
  bordroOptimizasyon: true,
});

export const createInitialVergiselTesvikFormState = (): VergiselTesvikFormState => ({
  mukellefType: "LIMITED_SIRKET",
  isTaxPayerInTurkey: true,
  isIncomeTaxPayer: false,
  isCorporateTaxPayer: true,
  isKdvPayer: true,
  isRealProcedure: true,
  isNewCompany: false,
  establishmentDate: "",
  hasTaxDebt: false,
  hasSgkDebt: false,
  hasEdocsObligation: true,
  worksWithAdvisor: true,
  filingsRegular: true,
  hasTaxRiskHistory: false,

  hasTeknokentActivity: false,
  hasTeknokentContract: false,
  hasTeknokentActivityDoc: false,
  hasTeknokentProjectApproval: false,
  hasSoftwareArgeDesignProject: false,
  incomeOnlyFromTeknokentProject: false,
  tracksInOutRegionActivities: false,
  classifiesArgeSupportPersonnel: false,
  tracksInOutRegionWorkTime: false,
  tracksRemoteWorkAndClassification: false,
  evaluatesTeknokentKdvException: false,
  separatesProjectIncomeInAccounting: false,
  hasTeknokentYmmReporting: false,

  hasArgeCenterDoc: false,
  hasDesignCenterDoc: false,
  hasArgeProject: false,
  hasSufficientArgePersonnel: false,
  tracksSupportPersonnelRatio: false,
  hasTimesheetRecords: false,
  tracksArgeExpensesSeparately: false,
  calculatesArgeDeduction: false,
  appliesIncomeTaxWithholdingSupport: false,
  appliesStampTaxException: false,
  appliesSgkEmployerSupport: false,
  hasCustomsOrKdvExceptionPotential: false,
  documentsArgeQualification: false,

  isRealPersonEntrepreneur: false,
  firstIncomeTaxRegistration: false,
  underAgeLimitAtStart: false,
  notifiedStartOnTime: false,
  operatesOwnNameAndAccount: false,
  allPartnersMeetYouthCriteria: false,
  isBusinessTransferCase: false,
  usedYoungEntrepreneurBefore: false,
  tracksYoungEntrepreneurLimitAndDuration: false,
  checksBagkur2026Status: true,

  hasYatirimTesvikCertificate: false,
  hasETuysApplication: false,
  investmentSubjectAndLocationClear: false,
  hasMachineryPurchaseForKdvException: false,
  needsCustomsExemptionForImportedMachinery: false,
  hasCorporateTaxDiscountSupport: false,
  hasSgkEmployerSupportInYtb: false,
  hasInterestSupportInYtb: false,
  investmentCompleted: false,
  completionVisaDone: false,
  hasPreCertificateExpenses: false,
  machineryListMatchesDocs: false,
  tracksInvestmentExpensesSeparately: false,

  hasFreeZoneActivity: false,
  hasFreeZoneLicense: false,
  freeZoneActivityTypeProduction: false,
  hasProductionIncomeInFreeZone: false,
  hasExportSales: false,
  hasSalesToFreeZoneOrOtherFreeZones: false,
  evaluatesWageTaxExceptionInFreeZone: false,
  evaluatesKdvCustomsStampAdvantagesInFreeZone: false,
  tracksFreeZoneIncomeSeparately: false,
  licenseScopeMatchesIncomeTypes: false,

  doesGoodsExport: false,
  doesServiceExport: false,
  hasFxServiceTypes: false,
  hasExportInvoicesAndCustomsDocs: false,
  canProveServiceExportConditions: false,
  appliesKdvExceptionOnExports: false,
  receivesKdvRefund: false,
  evaluatesServiceExportTaxDeduction: false,
  collectsExportProceedsViaBank: false,
  needsVrhib: false,

  hasFxEarningTransaction: false,
  hasExportLinkedContracts: false,
  hasStampAndFeeGeneratingTransactions: false,
  willApplyVrhibViaDys: false,
  contractSignedBeforeVrhib: false,
  vrhibScopeMatchesAmountAndDuration: false,
  hasAnotherExceptionSameTransaction: false,

  hasSpecialKdvExceptionCases: false,
  hasYtbMachineryPurchaseForKdv: false,
  willRequestKdvRefund: false,
  hasReducedRateDeliveries: false,
  hasExportRegisteredDeliveries: false,
  preparesKdvRefundFile: false,
  needsYmmForKdvRefund: false,
  hasKdvListsAndDeclarations: false,
  hasSpecialPrinciplesRisk: false,

  isInOsb: false,
  hasOsbConstructionLandTransactions: false,
  transactsWithOsbLegalEntity: false,
  evaluatesOsbTaxExemptions: false,
  hasOsbYtbSubRegionAdvantage: false,

  hasMealBenefit: false,
  hasTransportBenefit: false,
  hasBonusSystem: false,
  hasPrivateHealthOrBesContribution: false,
  hasBoardAllowancePayment: false,
  hasExecutiveCompensations: false,
  hasBordroIncentiveConflicts: false,
  doesNetBrutPlanning: false,
  analyzesPayrollTaxAndSgkEffects: false,

  hasSeparateAccountingAccounts: false,
  hasProjectCostCenters: false,
  hasPersonnelTimeRecords: false,
  hasInvoiceBankContractFiles: false,
  hasDeclarationControls: false,
  needsYmmReportGeneral: false,
  needsBoardOrGeneralAssemblyDecisions: false,
  doesPeriodicIncentiveControls: false,
  hasAuthorityPermitsAndLicenses: false,
});
