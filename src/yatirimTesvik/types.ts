export type YatirimTesvikStatus = "UYGUN" | "POTANSİYEL" | "UYGUN DEĞİL / RİSKLİ";

export type InvestorCompanyType = "Sahis" | "Limited" | "Anonim" | "Kooperatif" | "YabanciSermayeli" | "Diger";
export type FinancingModel = "OzKaynak" | "BankaKredisi" | "Leasing" | "Yatirimci" | "Karma";
export type InvestmentType = "YeniYatirim" | "Tevsi" | "Modernizasyon" | "UrunCesitlendirme" | "Entegrasyon" | "KompleYeniTesis";
export type LocationZoneType = "OSB" | "EndustriBolgesi" | "SerbestBolge" | "Teknopark" | "Diger" | "Yok";
export type CreditCurrency = "TL" | "Doviz" | "Yok";
export type SpendingTiming = "BelgeOncesi" | "BelgeSonrasi" | "Karisik";

export interface YatirimTesvikFormState {
  isTurkeyResident: boolean;
  companyType: InvestorCompanyType;
  isKobi: boolean;
  isLargeEnterprise: boolean;
  isManufacturing: boolean;
  isServiceSector: boolean;
  sectorFocus: string;
  hasPreviousIncentiveCertificate: boolean;
  hasActiveIncentiveCertificate: boolean;
  hasETuysAuthorization: boolean;
  hasTaxOrSgkDebt: boolean;
  financingModel: FinancingModel;

  investmentType: InvestmentType;
  isInvestmentLocationKnown: boolean;
  investmentCity: string;
  investmentDistrict: string;
  isInOsb: boolean;
  locationZoneType: LocationZoneType;
  investmentSubject: string;
  naceCode: string;
  investmentAmount: number;
  meetsMinimumFixedInvestment: boolean;
  investmentDurationMonths: number;
  investmentStarted: boolean;
  hasPreCertificateExpenses: boolean;
  hasImportedMachinery: boolean;
  hasDomesticMachinery: boolean;
  hasConstructionExpense: boolean;
  hasEnergyExpense: boolean;
  hasLandExpense: boolean;
  hasBuildingExpense: boolean;
  hasSoftwareLicenseExpense: boolean;
  hasInfrastructureExpense: boolean;

  isMediumHighOrHighTech: boolean;
  alignsWithPriorityProductLists: boolean;
  hasImportSubstitutionImpact: boolean;
  hasCurrentAccountDeficitReductionImpact: boolean;
  hasExportPotential: boolean;
  hasStrategicOrCriticalTechnology: boolean;
  advancedTechnologyArea: string;
  alignsWithCityPrioritySectors: boolean;
  hasLocalSupplyOrEmploymentImpact: boolean;
  isInServicePriorityAreas: boolean;

  fitsTechnologyHamlesi: boolean;
  includesHighTechProduction: boolean;
  fitsStrategicHamle: boolean;
  includesCriticalProductProduction: boolean;
  fitsLocalDevelopmentHamlesi: boolean;
  alignsWithLocalProgramTopics: boolean;
  fitsProjectBasedScale: boolean;
  createsNewEmployment: boolean;
  expectedNewEmploymentCount: number;
  contributesWomenOrYouthEmployment: boolean;
  createsHighAddedValue: boolean;

  needsVatExemption: boolean;
  needsCustomDutyExemption: boolean;
  needsTaxReduction: boolean;
  needsSgkEmployerSupport: boolean;
  needsSgkEmployeeSupport: boolean;
  needsInterestSupport: boolean;
  needsInvestmentPlaceAllocation: boolean;
  needsMachineryOrCashSupport: boolean;
  needsEnergySupport: boolean;
  needsVatRefund: boolean;
  needsQualifiedPersonnelSupport: boolean;
  needsPurchaseGuaranteeSupport: boolean;

  regionalCategory: string;
  isInDisasterRegion: boolean;
  mayGetSubRegionSupport: boolean;
  willWorkWithLocalSuppliers: boolean;

  willUseCredit: boolean;
  creditCurrency: CreditCurrency;
  willUseLeasing: boolean;
  machineryOrdersPlaced: boolean;
  invoicesIssued: boolean;
  importProcessesStarted: boolean;
  spendingTiming: SpendingTiming;
  hasFinancialFeasibility: boolean;
  hasCapacityReport: boolean;
  hasProformaInvoices: boolean;
  hasMachineryList: boolean;
  hasConstructionPermitOrLandAllocation: boolean;
}

export interface YatirimTesvikSupportDefinition {
  id: string;
  supportType: string;
  institution: string;
  legalFramework: string;
  applicantProfile: string;
  suitableInvestmentType: string;
  supportElements: string;
  applicationChannel: string;
  callBased?: boolean;
}

export interface YatirimTesvikResult {
  id: string;
  supportType: string;
  status: YatirimTesvikStatus;
  institution: string;
  legalFramework: string;
  applicantProfile: string;
  suitableInvestmentType: string;
  supportElements: string;
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

export interface YatirimTesvikSummary {
  uygunCount: number;
  potansiyelCount: number;
  riskliCount: number;
  preCertificateSpendingRisk: string;
  etuysReadiness: ScoreInfo;
  suitabilityScore: ScoreInfo;
}

export const createInitialYatirimTesvikFormState = (): YatirimTesvikFormState => ({
  isTurkeyResident: true,
  companyType: "Limited",
  isKobi: true,
  isLargeEnterprise: false,
  isManufacturing: true,
  isServiceSector: false,
  sectorFocus: "",
  hasPreviousIncentiveCertificate: false,
  hasActiveIncentiveCertificate: false,
  hasETuysAuthorization: false,
  hasTaxOrSgkDebt: false,
  financingModel: "Karma",

  investmentType: "YeniYatirim",
  isInvestmentLocationKnown: false,
  investmentCity: "",
  investmentDistrict: "",
  isInOsb: false,
  locationZoneType: "Yok",
  investmentSubject: "",
  naceCode: "",
  investmentAmount: 0,
  meetsMinimumFixedInvestment: false,
  investmentDurationMonths: 12,
  investmentStarted: false,
  hasPreCertificateExpenses: false,
  hasImportedMachinery: false,
  hasDomesticMachinery: false,
  hasConstructionExpense: false,
  hasEnergyExpense: false,
  hasLandExpense: false,
  hasBuildingExpense: false,
  hasSoftwareLicenseExpense: false,
  hasInfrastructureExpense: false,

  isMediumHighOrHighTech: false,
  alignsWithPriorityProductLists: false,
  hasImportSubstitutionImpact: false,
  hasCurrentAccountDeficitReductionImpact: false,
  hasExportPotential: false,
  hasStrategicOrCriticalTechnology: false,
  advancedTechnologyArea: "",
  alignsWithCityPrioritySectors: false,
  hasLocalSupplyOrEmploymentImpact: false,
  isInServicePriorityAreas: false,

  fitsTechnologyHamlesi: false,
  includesHighTechProduction: false,
  fitsStrategicHamle: false,
  includesCriticalProductProduction: false,
  fitsLocalDevelopmentHamlesi: false,
  alignsWithLocalProgramTopics: false,
  fitsProjectBasedScale: false,
  createsNewEmployment: false,
  expectedNewEmploymentCount: 0,
  contributesWomenOrYouthEmployment: false,
  createsHighAddedValue: false,

  needsVatExemption: true,
  needsCustomDutyExemption: true,
  needsTaxReduction: true,
  needsSgkEmployerSupport: true,
  needsSgkEmployeeSupport: false,
  needsInterestSupport: false,
  needsInvestmentPlaceAllocation: false,
  needsMachineryOrCashSupport: false,
  needsEnergySupport: false,
  needsVatRefund: false,
  needsQualifiedPersonnelSupport: false,
  needsPurchaseGuaranteeSupport: false,

  regionalCategory: "",
  isInDisasterRegion: false,
  mayGetSubRegionSupport: false,
  willWorkWithLocalSuppliers: false,

  willUseCredit: false,
  creditCurrency: "Yok",
  willUseLeasing: false,
  machineryOrdersPlaced: false,
  invoicesIssued: false,
  importProcessesStarted: false,
  spendingTiming: "BelgeSonrasi",
  hasFinancialFeasibility: false,
  hasCapacityReport: false,
  hasProformaInvoices: false,
  hasMachineryList: false,
  hasConstructionPermitOrLandAllocation: false,
});
