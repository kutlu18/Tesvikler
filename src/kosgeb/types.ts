export type KosgebSupportStatus = "UYGUN" | "POTANSİYEL" | "UYGUN DEĞİL / RİSKLİ";

export type CompanyType = "Sahis" | "Limited" | "Anonim" | "Kooperatif";

export interface KosgebFormState {
  isKobi: boolean;
  companyType: CompanyType;
  establishmentDate: string;
  naceCode: string;
  isManufacturing: boolean;
  isTechOrArge: boolean;
  isTradeOrService: boolean;
  employeeCount: number;
  annualNetSales: number | null;
  balanceSheetSize: number;
  hasTaxOrSgkDebt: boolean;
  isKosgebRegistered: boolean;
  isKobiDeclarationCurrent: boolean;

  isNewlyEstablished: boolean;
  founderHasKosgebTraining: boolean;
  founderIsWoman: boolean;
  founderIsYoung: boolean;
  founderIsDisabledVeteranOrMartyrRelative: boolean;
  establishedWithin3Years: boolean;
  wantsBusinessDevelopmentInvestment: boolean;

  plansMachineEquipment: boolean;
  plansSoftware: boolean;
  plansEmployment: boolean;
  plansTrainingConsulting: boolean;
  needsCertificationTestAnalysis: boolean;
  plansDesignService: boolean;
  plansIndustrialProperty: boolean;
  plansMarketingPromotion: boolean;
  hasExportGoal: boolean;
  plansDigitalizationInvestment: boolean;
  plansEnergyEfficiencyOrGreenTransformation: boolean;
  projectBudget: number;

  developsNewProduct: boolean;
  plansTechnologicalImprovement: boolean;
  plansPrototypeOrMvp: boolean;
  hasUniversityTechnoparkRAndDLink: boolean;
  hasPatentableTechnology: boolean;
  plansMassProduction: boolean;
  hasDomesticProductionOrImportSubstitutionFocus: boolean;

  hasHighEnergyConsumption: boolean;
  hasEnergyAudit: boolean;
  plansEfficientMotorInvestment: boolean;
  targetsCarbonReduction: boolean;
  plansGesOrSustainabilityInvestment: boolean;
  hasGreenDealOrCbamRisk: boolean;

  needsCredit: boolean;
  needsWorkingCapital: boolean;
  needsInvestmentLoan: boolean;
  seeksInterestOrProfitShareSupport: boolean;
  hasCollateralProblem: boolean;
}

export interface KosgebSupportDefinition {
  id: string;
  name: string;
  institution: string;
  supportType: string;
  beneficiaries: string;
  coveredExpenses: string;
  estimatedSupportStructure: string;
  requiredDocuments: string[];
}

export interface KosgebSupportResult {
  id: string;
  supportName: string;
  status: KosgebSupportStatus;
  institution: string;
  supportType: string;
  beneficiaries: string;
  coveredExpenses: string;
  estimatedSupportStructure: string;
  whyEligible: string[];
  howToGet: string[];
  whyNotEligible: string[];
  howToBecomeEligible: string[];
  requiredDocuments: string[];
  nextAction: string;
  riskNote: string;
}

export interface KosgebEvaluationSummary {
  uygunCount: number;
  potansiyelCount: number;
  riskliCount: number;
  totalOpportunityCount: number;
}

export const createInitialKosgebFormState = (): KosgebFormState => ({
  isKobi: true,
  companyType: "Limited",
  establishmentDate: "",
  naceCode: "",
  isManufacturing: false,
  isTechOrArge: false,
  isTradeOrService: true,
  employeeCount: 5,
  annualNetSales: null,
  balanceSheetSize: 0,
  hasTaxOrSgkDebt: false,
  isKosgebRegistered: false,
  isKobiDeclarationCurrent: false,

  isNewlyEstablished: true,
  founderHasKosgebTraining: false,
  founderIsWoman: false,
  founderIsYoung: false,
  founderIsDisabledVeteranOrMartyrRelative: false,
  establishedWithin3Years: true,
  wantsBusinessDevelopmentInvestment: true,

  plansMachineEquipment: false,
  plansSoftware: false,
  plansEmployment: false,
  plansTrainingConsulting: false,
  needsCertificationTestAnalysis: false,
  plansDesignService: false,
  plansIndustrialProperty: false,
  plansMarketingPromotion: false,
  hasExportGoal: false,
  plansDigitalizationInvestment: false,
  plansEnergyEfficiencyOrGreenTransformation: false,
  projectBudget: 0,

  developsNewProduct: false,
  plansTechnologicalImprovement: false,
  plansPrototypeOrMvp: false,
  hasUniversityTechnoparkRAndDLink: false,
  hasPatentableTechnology: false,
  plansMassProduction: false,
  hasDomesticProductionOrImportSubstitutionFocus: false,

  hasHighEnergyConsumption: false,
  hasEnergyAudit: false,
  plansEfficientMotorInvestment: false,
  targetsCarbonReduction: false,
  plansGesOrSustainabilityInvestment: false,
  hasGreenDealOrCbamRisk: false,

  needsCredit: false,
  needsWorkingCapital: false,
  needsInvestmentLoan: false,
  seeksInterestOrProfitShareSupport: false,
  hasCollateralProblem: false,
});
