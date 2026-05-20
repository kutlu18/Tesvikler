export type TubitakSupportStatus = "UYGUN" | "POTANSİYEL" | "UYGUN DEĞİL / RİSKLİ";

export type TubitakCompanyType = "Limited" | "Anonim" | "Diger";

export interface TubitakFormState {
  isTurkeyResident: boolean;
  companyType: TubitakCompanyType;
  isSoleProprietorship: boolean;
  isKobi: boolean;
  isLargeEnterprise: boolean;
  establishmentDate: string;
  isInTechnopark: boolean;
  isArgeOrDesignCenter: boolean;
  hasPreviousTubitakProject: boolean;
  hasPrevious1507: boolean;
  hasPrevious1501: boolean;
  hasPreviousBigg: boolean;
  hasTaxOrSgkDebt: boolean;
  hasProdisRegistration: boolean;
  hasPreRegistrationDocs: boolean;

  hasNewProductDevelopment: boolean;
  hasNewProcessDevelopment: boolean;
  hasTechImprovement: boolean;
  hasTechnicalUncertainty: boolean;
  isRoutineCommercialProject: boolean;
  hasOriginalValue: boolean;
  hasTechnicalDifferentiation: boolean;
  hasCommercializationPotential: boolean;
  hasPrototypeMvpPilotDemo: boolean;
  targetTrl: number;
  currentTrl: number;
  projectDurationMonths: number;
  projectBudget: number;
  inPriorityTechnologyArea: boolean;
  hasGreenTransformationScope: boolean;
  hasAiOrDeepTechScope: boolean;

  hasPersonnelExpense: boolean;
  hasMachineryExpense: boolean;
  hasSoftwareLicenseExpense: boolean;
  hasMaterialExpense: boolean;
  hasTestAnalysisValidationExpense: boolean;
  hasConsultingServiceExpense: boolean;
  hasTravelExpense: boolean;
  hasUniversityServiceProcurement: boolean;
  expectsPatentOutput: boolean;
  hasCommercializationPlan: boolean;

  hasUniversityCollaboration: boolean;
  hasCompanyPartnership: boolean;
  hasCustomerOrganization: boolean;
  isCustomerDrivenProject: boolean;
  customerWillBuyOrUseOutput: boolean;
  customerWillContributeBudget: boolean;
  hasPublicOrLargeDataOwnerInstitution: boolean;
  hasAiDataProviderInstitution: boolean;

  isEarlyStageTechStartup: boolean;
  foundersNotIncorporatedYet: boolean;
  isNewlyIncorporated: boolean;
  hasTechBasedBusinessIdea: boolean;
  needsMentoringOrAcceleration: boolean;

  improvesEnergyEfficiency: boolean;
  reducesCarbonEmission: boolean;
  improvesResourceEfficiency: boolean;
  includesCircularEconomy: boolean;
  addressesGreenDealOrCbam: boolean;
  includesIndustrialGreenTransformation: boolean;

  hasInternationalPartner: boolean;
  fitsInternationalPrograms: boolean;
  targetsGlobalMarket: boolean;
  hasForeignCustomerPilotOrResearchPartner: boolean;
}

export interface TubitakSupportDefinition {
  id: string;
  supportName: string;
  programCode: string;
  institution: string;
  supportType: string;
  applicantProfile: string;
  projectType: string;
  supportedExpenses: string;
  estimatedSupportStructure: string;
  applicationChannel: string;
  callBased?: boolean;
}

export interface TubitakSupportResult {
  id: string;
  supportName: string;
  status: TubitakSupportStatus;
  institution: string;
  programCode: string;
  supportType: string;
  applicantProfile: string;
  projectType: string;
  supportedExpenses: string;
  estimatedSupportStructure: string;
  whyEligible: string[];
  howToGet: string[];
  whyNotEligible: string[];
  howToBecomeEligible: string[];
  requiredDocuments: string[];
  applicationChannel: string;
  nextAction: string;
  riskNote: string;
  callCheckRequired: boolean;
}

export interface TubitakSummary {
  uygunCount: number;
  potansiyelCount: number;
  riskliCount: number;
  argeScore: number;
  argeScoreComment: string;
  callCheckCount: number;
}

export const createInitialTubitakFormState = (): TubitakFormState => ({
  isTurkeyResident: true,
  companyType: "Limited",
  isSoleProprietorship: false,
  isKobi: true,
  isLargeEnterprise: false,
  establishmentDate: "",
  isInTechnopark: false,
  isArgeOrDesignCenter: false,
  hasPreviousTubitakProject: false,
  hasPrevious1507: false,
  hasPrevious1501: false,
  hasPreviousBigg: false,
  hasTaxOrSgkDebt: false,
  hasProdisRegistration: false,
  hasPreRegistrationDocs: false,

  hasNewProductDevelopment: true,
  hasNewProcessDevelopment: false,
  hasTechImprovement: false,
  hasTechnicalUncertainty: true,
  isRoutineCommercialProject: false,
  hasOriginalValue: true,
  hasTechnicalDifferentiation: true,
  hasCommercializationPotential: true,
  hasPrototypeMvpPilotDemo: true,
  targetTrl: 6,
  currentTrl: 3,
  projectDurationMonths: 12,
  projectBudget: 0,
  inPriorityTechnologyArea: false,
  hasGreenTransformationScope: false,
  hasAiOrDeepTechScope: false,

  hasPersonnelExpense: true,
  hasMachineryExpense: false,
  hasSoftwareLicenseExpense: false,
  hasMaterialExpense: false,
  hasTestAnalysisValidationExpense: false,
  hasConsultingServiceExpense: false,
  hasTravelExpense: false,
  hasUniversityServiceProcurement: false,
  expectsPatentOutput: false,
  hasCommercializationPlan: true,

  hasUniversityCollaboration: false,
  hasCompanyPartnership: false,
  hasCustomerOrganization: false,
  isCustomerDrivenProject: false,
  customerWillBuyOrUseOutput: false,
  customerWillContributeBudget: false,
  hasPublicOrLargeDataOwnerInstitution: false,
  hasAiDataProviderInstitution: false,

  isEarlyStageTechStartup: false,
  foundersNotIncorporatedYet: false,
  isNewlyIncorporated: false,
  hasTechBasedBusinessIdea: false,
  needsMentoringOrAcceleration: false,

  improvesEnergyEfficiency: false,
  reducesCarbonEmission: false,
  improvesResourceEfficiency: false,
  includesCircularEconomy: false,
  addressesGreenDealOrCbam: false,
  includesIndustrialGreenTransformation: false,

  hasInternationalPartner: false,
  fitsInternationalPrograms: false,
  targetsGlobalMarket: false,
  hasForeignCustomerPilotOrResearchPartner: false,
});
