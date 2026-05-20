export type TicaretSupportClass = "MAL" | "EIHRACAT" | "HIZMET";
export type CompanyType = "Sahis" | "Limited" | "Anonim" | "Kooperatif" | "IhracatciBirligiUyesi" | "Diger";
export type AnnualExportBand = "Yok" | "0_100K" | "100K_1M" | "1M_10M" | "10M_USTU";
export type SalesModel = "B2C" | "B2B" | "B2B2C" | "Karisik";
export type ServiceSector =
  | "BilisimYazilimSaaS"
  | "Oyun"
  | "SaglikTurizmi"
  | "Egitim"
  | "YonetimDanismanligi"
  | "TeknikMusavirlik"
  | "Lojistik"
  | "Fuarcilik"
  | "FilmDiziAnimasyon"
  | "ReklamPazarlamaTasarim"
  | "Diger";

export type TicaretSupportStatus = "UYGUN" | "POTANSİYEL" | "UYGUN DEĞİL / RİSKLİ";

export interface TicaretSupportSelection {
  mal: boolean;
  eihracat: boolean;
  hizmet: boolean;
}

export interface TicaretFormState {
  isTurkeyResident: boolean;
  companyType: CompanyType;
  isKobi: boolean;
  isProducer: boolean;
  isManufacturerExporter: boolean;
  isCommercialExporter: boolean;
  isServiceExporter: boolean;
  isEExporter: boolean;
  isExporterUnionMember: boolean;
  hasDys: boolean;
  hasMersisCurrent: boolean;
  hasKep: boolean;
  hasESignOrFinancialSeal: boolean;
  hasTaxOrSgkDebt: boolean;
  hasPreviousMinistrySupport: boolean;
  hadPreviousMissingDocOrRejection: boolean;

  currentlyExports: boolean;
  exportedLast12Months: boolean;
  annualExportBand: AnnualExportBand;
  exportCountryCount: number;
  hasTargetMarkets: boolean;
  wantsNewMarketEntry: boolean;
  wantsFindForeignCustomers: boolean;
  hasExportStrategyPlan: boolean;
  hasForeignLanguageSalesAssets: boolean;
  knowsGtipNaceOrServiceCode: boolean;
  issuesForeignCurrencyServiceInvoice: boolean;
  canDocumentCollectionsViaBank: boolean;

  hasPhysicalProductExport: boolean;
  productsProducedInTurkey: boolean;
  exportsSuppliedProducts: boolean;
  needsMarketEntryCertificate: boolean;
  needsCeFdaIsoEtc: boolean;
  plansForeignTrademarkRegistration: boolean;
  plansForeignCompanyOrBrandAcquisition: boolean;
  plansForeignUnitOpening: boolean;
  willHaveForeignRentExpense: boolean;
  plansForeignPromotionAndAds: boolean;
  plansOverseasFairParticipation: boolean;
  plansDomesticInternationalFairParticipation: boolean;
  wantsTradeDelegationParticipation: boolean;
  fitsUrgeOrExportConsortium: boolean;
  wantsGlobalSupplyChainParticipation: boolean;
  needsDesignCollectionDevelopment: boolean;
  hasTurqualityGoal: boolean;
  needsResponsibleGreenCompliance: boolean;
  hasCbamOrSustainabilityRisk: boolean;

  sellsOnlineAbroad: boolean;
  sellsViaMarketplace: boolean;
  sellsViaOwnEcommerceSite: boolean;
  isRetailEcommerceSite: boolean;
  isMarketplaceOperator: boolean;
  canBeEexportConsortium: boolean;
  salesModel: SalesModel;
  runsDigitalAdsAbroad: boolean;
  paysMarketplaceCommissions: boolean;
  usesForeignFulfillmentOrReturnCenter: boolean;
  usesMicroExportOrEtgb: boolean;
  hasLocalizationContentCosts: boolean;
  buildsEexportSoftwareIntegration: boolean;
  hasTargetCountryDigitalPlan: boolean;
  plansForeignTrademarkOrDomain: boolean;
  canDocumentEexportSalesAndCosts: boolean;

  providesServiceExport: boolean;
  serviceDeliveredToForeignCustomer: boolean;
  collectsRevenueInForeignCurrency: boolean;
  issuesInvoiceToForeignCustomer: boolean;
  serviceSector: ServiceSector;
  runsServicePromotionAbroad: boolean;
  joinsServiceEventsB2B: boolean;
  plansServiceForeignOffice: boolean;
  plansServiceForeignTrademark: boolean;
  needsMarketEntryReportOrConsultancy: boolean;
  needsCertificationAccreditationLicense: boolean;
  hasHealthTourismAuthorizationProcess: boolean;
  hasSaasLicenseSubscriptionExport: boolean;
  hasGameRevenueAndPublisherAgreements: boolean;
  hasInternationalEducationRevenue: boolean;

  expenseIncurred: boolean;
  checkedPreApprovalOrOnayRequirement: boolean;
  hasInvoicesDecotsContractsAndProof: boolean;
  paymentsFromCompanyBankAccount: boolean;
  expenseTargetsForeignMarket: boolean;
  withinApplicationTimeLimit: boolean;
  notFundedByOtherPublicSupport: boolean;
  needsTranslationOrApostille: boolean;
  knowsApplicationAuthority: boolean;
  knowsDysKepEsignSubmissionPath: boolean;
  hasDigitalDocumentArchive: boolean;
}

export interface TicaretSupportDefinition {
  id: string;
  supportName: string;
  supportClass: TicaretSupportClass;
  institution: string;
  legalBasis: string;
  supportScope: string;
  applicantProfile: string;
  supportedExpenses: string;
  estimatedStructure: string;
  applicationChannel: string;
  requiresSpecialStatus?: boolean;
}

export interface TicaretSupportResult {
  id: string;
  supportName: string;
  supportClass: TicaretSupportClass;
  status: TicaretSupportStatus;
  institution: string;
  legalBasis: string;
  applicantProfile: string;
  supportedExpenses: string;
  estimatedStructure: string;
  whyEligible: string[];
  howToGet: string[];
  whyNotEligible: string[];
  howToBecomeEligible: string[];
  requiredDocuments: string[];
  applicationChannel: string;
  nextAction: string;
  riskNote: string;
}

export interface ScoreInfo {
  score: number;
  comment: string;
}

export interface TicaretSummary {
  uygunCount: number;
  potansiyelCount: number;
  riskliCount: number;
  missingDocumentCount: number;
  dysReadiness: ScoreInfo;
  exportSuitability: ScoreInfo;
}

export const createInitialSupportSelection = (): TicaretSupportSelection => ({
  mal: true,
  eihracat: true,
  hizmet: true,
});

export const createInitialTicaretFormState = (): TicaretFormState => ({
  isTurkeyResident: true,
  companyType: "Limited",
  isKobi: true,
  isProducer: true,
  isManufacturerExporter: true,
  isCommercialExporter: false,
  isServiceExporter: false,
  isEExporter: false,
  isExporterUnionMember: false,
  hasDys: false,
  hasMersisCurrent: true,
  hasKep: false,
  hasESignOrFinancialSeal: false,
  hasTaxOrSgkDebt: false,
  hasPreviousMinistrySupport: false,
  hadPreviousMissingDocOrRejection: false,

  currentlyExports: false,
  exportedLast12Months: false,
  annualExportBand: "Yok",
  exportCountryCount: 0,
  hasTargetMarkets: false,
  wantsNewMarketEntry: true,
  wantsFindForeignCustomers: true,
  hasExportStrategyPlan: false,
  hasForeignLanguageSalesAssets: false,
  knowsGtipNaceOrServiceCode: false,
  issuesForeignCurrencyServiceInvoice: false,
  canDocumentCollectionsViaBank: false,

  hasPhysicalProductExport: false,
  productsProducedInTurkey: true,
  exportsSuppliedProducts: false,
  needsMarketEntryCertificate: false,
  needsCeFdaIsoEtc: false,
  plansForeignTrademarkRegistration: false,
  plansForeignCompanyOrBrandAcquisition: false,
  plansForeignUnitOpening: false,
  willHaveForeignRentExpense: false,
  plansForeignPromotionAndAds: false,
  plansOverseasFairParticipation: false,
  plansDomesticInternationalFairParticipation: false,
  wantsTradeDelegationParticipation: false,
  fitsUrgeOrExportConsortium: false,
  wantsGlobalSupplyChainParticipation: false,
  needsDesignCollectionDevelopment: false,
  hasTurqualityGoal: false,
  needsResponsibleGreenCompliance: false,
  hasCbamOrSustainabilityRisk: false,

  sellsOnlineAbroad: false,
  sellsViaMarketplace: false,
  sellsViaOwnEcommerceSite: false,
  isRetailEcommerceSite: false,
  isMarketplaceOperator: false,
  canBeEexportConsortium: false,
  salesModel: "Karisik",
  runsDigitalAdsAbroad: false,
  paysMarketplaceCommissions: false,
  usesForeignFulfillmentOrReturnCenter: false,
  usesMicroExportOrEtgb: false,
  hasLocalizationContentCosts: false,
  buildsEexportSoftwareIntegration: false,
  hasTargetCountryDigitalPlan: false,
  plansForeignTrademarkOrDomain: false,
  canDocumentEexportSalesAndCosts: false,

  providesServiceExport: false,
  serviceDeliveredToForeignCustomer: false,
  collectsRevenueInForeignCurrency: false,
  issuesInvoiceToForeignCustomer: false,
  serviceSector: "BilisimYazilimSaaS",
  runsServicePromotionAbroad: false,
  joinsServiceEventsB2B: false,
  plansServiceForeignOffice: false,
  plansServiceForeignTrademark: false,
  needsMarketEntryReportOrConsultancy: false,
  needsCertificationAccreditationLicense: false,
  hasHealthTourismAuthorizationProcess: false,
  hasSaasLicenseSubscriptionExport: false,
  hasGameRevenueAndPublisherAgreements: false,
  hasInternationalEducationRevenue: false,

  expenseIncurred: false,
  checkedPreApprovalOrOnayRequirement: false,
  hasInvoicesDecotsContractsAndProof: false,
  paymentsFromCompanyBankAccount: false,
  expenseTargetsForeignMarket: false,
  withinApplicationTimeLimit: false,
  notFundedByOtherPublicSupport: true,
  needsTranslationOrApostille: false,
  knowsApplicationAuthority: false,
  knowsDysKepEsignSubmissionPath: false,
  hasDigitalDocumentArchive: false,
});
