export type KalkinmaSupportStatus = "UYGUN" | "POTANSIYEL" | "UYGUN DEGIL / RISKLI";

export type KalkinmaSupportClass =
  | "MALI_DESTEK"
  | "TEKNIK_DESTEK"
  | "FIZIBILITE"
  | "FAIZSIZ_KREDI"
  | "FAIZ_KAR_PAYI"
  | "GUDUMLU_PROJE"
  | "SOSYAL_GELISME"
  | "YEREL_URUN"
  | "TURIZM_YARATICI"
  | "DIJITAL_DONUSUM"
  | "YESIL_DONUSUM"
  | "AFET_DAYANIKLILIGI";

export type ApplicantType =
  | "KOBI_OZEL_SEKTOR"
  | "KOOPERATIF"
  | "BELEDIYE_KAMU"
  | "UNIVERSITE"
  | "STK_DERNEK_VAKIF"
  | "ODA_BORSA_BIRLIK"
  | "OSB"
  | "TGB"
  | "YEREL_YONETIM_ISTIRAKI"
  | "DIGER";

export type NeedType =
  | "maliDestek"
  | "teknikDestek"
  | "fizibilite"
  | "faizsizKredi"
  | "faizKarPayi"
  | "gudumluProje"
  | "sosyalGelisme"
  | "yerelUrun"
  | "dijitalDonusum"
  | "yesilDonusum";

export interface NeedSelection {
  maliDestek: boolean;
  teknikDestek: boolean;
  fizibilite: boolean;
  faizsizKredi: boolean;
  faizKarPayi: boolean;
  gudumluProje: boolean;
  sosyalGelisme: boolean;
  yerelUrun: boolean;
  dijitalDonusum: boolean;
  yesilDonusum: boolean;
}

export interface KalkinmaFormState {
  applicantType: ApplicantType;
  isTurkeyResident: boolean;
  applicantCity: string;
  agencyRegionKnown: boolean;
  isKobi: boolean;
  isManufacturer: boolean;
  isServiceSector: boolean;
  exports: boolean;
  receivedAgencySupportBefore: boolean;
  hadProjectCancellationOrIrregularity: boolean;
  hasTaxOrSgkDebt: boolean;
  canProvideCoFinance: boolean;
  hasProjectManagementCapacity: boolean;

  projectCity: string;
  projectDistrict: string;
  hasMultiCityScope: boolean;
  projectInAgencyRegion: boolean;
  fitsRegionalPlanPriorities: boolean;
  fitsCityPrioritySectors: boolean;
  hasLocalDevelopmentImpact: boolean;
  linkedToSpecialArea: boolean;
  linkedToLocalProductTheme: boolean;

  projectSubject: string;
  isNewInvestment: boolean;
  isCapacityIncrease: boolean;
  isDigitalTransformation: boolean;
  isGreenTransformation: boolean;
  isSocialImpactProject: boolean;
  isFeasibilityProject: boolean;
  isTrainingConsultingNeed: boolean;
  isTourismCreativeProject: boolean;
  isLocalProductRuralProject: boolean;
  projectBudget: number;
  projectDurationMonths: number;
  hasProjectDraftFile: boolean;
  hasProjectOutputsAndIndicators: boolean;
  hasPartnersOrAffiliates: boolean;
  hasSustainableRevenueModel: boolean;
  financedByOtherPublicSupport: boolean;

  hasMachineryEquipmentExpense: boolean;
  hasSoftwareDigitalExpense: boolean;
  hasConsultingExpense: boolean;
  hasTrainingExpense: boolean;
  hasFeasibilityReportExpense: boolean;
  hasConstructionRenovationExpense: boolean;
  hasPromotionBrandingExpense: boolean;
  hasPersonnelExpense: boolean;
  hasTravelOrganizationExpense: boolean;
  hasEnergyEfficiencyOrGesExpense: boolean;
  expensesBeforeApproval: boolean;
  hasProformaInvoices: boolean;
  hasTechnicalSpecifications: boolean;
  coFinanceBudgetAllocated: boolean;

  hasOpenFinancialCall: boolean;
  callOpenToPrivateSector: boolean;
  callOpenToNonProfitPublic: boolean;
  fitsProgramPriorities: boolean;
  budgetWithinCallLimits: boolean;
  coFinanceRateMet: boolean;
  readyForKaysSubmission: boolean;
  canMeetProcurementVisibilityReporting: boolean;

  technicalNeedIsCapacityBuilding: boolean;
  applicantEligibleForTechnicalSupport: boolean;
  technicalSupportNotCashMachinery: boolean;
  technicalNeedAreaRelevant: boolean;
  technicalOutputDefined: boolean;
  technicalTeamDefined: boolean;

  feasibilityBeforeInvestmentDecision: boolean;
  feasibilityHasRegionalImpact: boolean;
  feasibilityRelatedToRegionalOpportunity: boolean;
  feasibilityThemeRelevant: boolean;
  feasibilityCanLeadToInvestmentDecision: boolean;
  feasibilityApplicantEligible: boolean;
  feasibilityCoFinancePossible: boolean;
  feasibilityServiceProcurementPlanned: boolean;
  feasibilityCompletesWithinOneYear: boolean;

  financeProjectIsPrivateInvestment: boolean;
  financeNeedExists: boolean;
  financeFitsAgencyPriorities: boolean;
  financeViaIntermediaryPossible: boolean;
  financeRepaymentCapacity: boolean;
  financeCollateralSuitable: boolean;
  financeTypeInvestmentOrWorkingCapital: boolean;
  financeMaturityAndRepaymentPlanReady: boolean;

  guidedProjectWithStrategicActors: boolean;
  guidedProjectHighRegionalImpact: boolean;
  guidedProjectCreatesEcosystemImpact: boolean;
  guidedProjectBeyondSingleCompany: boolean;
  guidedProjectGovernanceReady: boolean;
  guidedProjectNeedsAgencyPreConsultation: boolean;

  hasKaysUserAccount: boolean;
  kaysAuthorizedSignatoryReady: boolean;
  hasSignatureAuthorityDocs: boolean;
  hasTaxCertificate: boolean;
  hasTradeRegistryGazette: boolean;
  hasActivityCertificate: boolean;
  hasFinancialStatements: boolean;
  hasApplicationFormDraft: boolean;
  hasProjectBudgetDraft: boolean;
  hasPartnerAffiliateDocs: boolean;
  hasCommitmentLetters: boolean;
  hasCoFinanceDeclaration: boolean;
  hasProjectTimeline: boolean;
  reviewedOpenCallGuideline: boolean;
}

export interface KalkinmaSupportDefinition {
  id: string;
  supportName: string;
  supportClass: KalkinmaSupportClass;
  institution: string;
  applicantProfile: string;
  suitableProjectType: string;
  supportedExpenses: string;
  estimatedSupportStructure: string;
  applicationChannel: string;
}

export interface KalkinmaSupportResult {
  id: string;
  supportName: string;
  status: KalkinmaSupportStatus;
  institution: string;
  supportClass: KalkinmaSupportClass;
  applicantProfile: string;
  suitableProjectType: string;
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
  sourceWarning: string;
  callCheckRequired: boolean;
}

export interface ScoreInfo {
  score: number;
  comment: string;
}

export interface KalkinmaSummary {
  uygunCount: number;
  potansiyelCount: number;
  riskliCount: number;
  callCheckCount: number;
  missingDocumentCount: number;
  kaysReadinessScore: ScoreInfo;
  kalkinmaAjansiUygunlukScore: ScoreInfo;
}

export const createInitialNeedSelection = (): NeedSelection => ({
  maliDestek: true,
  teknikDestek: true,
  fizibilite: true,
  faizsizKredi: true,
  faizKarPayi: true,
  gudumluProje: true,
  sosyalGelisme: true,
  yerelUrun: true,
  dijitalDonusum: true,
  yesilDonusum: true,
});

export const createInitialKalkinmaFormState = (): KalkinmaFormState => ({
  applicantType: "KOBI_OZEL_SEKTOR",
  isTurkeyResident: true,
  applicantCity: "",
  agencyRegionKnown: false,
  isKobi: true,
  isManufacturer: false,
  isServiceSector: true,
  exports: false,
  receivedAgencySupportBefore: false,
  hadProjectCancellationOrIrregularity: false,
  hasTaxOrSgkDebt: false,
  canProvideCoFinance: false,
  hasProjectManagementCapacity: false,

  projectCity: "",
  projectDistrict: "",
  hasMultiCityScope: false,
  projectInAgencyRegion: false,
  fitsRegionalPlanPriorities: false,
  fitsCityPrioritySectors: false,
  hasLocalDevelopmentImpact: false,
  linkedToSpecialArea: false,
  linkedToLocalProductTheme: false,

  projectSubject: "",
  isNewInvestment: false,
  isCapacityIncrease: false,
  isDigitalTransformation: false,
  isGreenTransformation: false,
  isSocialImpactProject: false,
  isFeasibilityProject: false,
  isTrainingConsultingNeed: false,
  isTourismCreativeProject: false,
  isLocalProductRuralProject: false,
  projectBudget: 0,
  projectDurationMonths: 12,
  hasProjectDraftFile: false,
  hasProjectOutputsAndIndicators: false,
  hasPartnersOrAffiliates: false,
  hasSustainableRevenueModel: false,
  financedByOtherPublicSupport: false,

  hasMachineryEquipmentExpense: false,
  hasSoftwareDigitalExpense: false,
  hasConsultingExpense: false,
  hasTrainingExpense: false,
  hasFeasibilityReportExpense: false,
  hasConstructionRenovationExpense: false,
  hasPromotionBrandingExpense: false,
  hasPersonnelExpense: false,
  hasTravelOrganizationExpense: false,
  hasEnergyEfficiencyOrGesExpense: false,
  expensesBeforeApproval: false,
  hasProformaInvoices: false,
  hasTechnicalSpecifications: false,
  coFinanceBudgetAllocated: false,

  hasOpenFinancialCall: false,
  callOpenToPrivateSector: false,
  callOpenToNonProfitPublic: false,
  fitsProgramPriorities: false,
  budgetWithinCallLimits: false,
  coFinanceRateMet: false,
  readyForKaysSubmission: false,
  canMeetProcurementVisibilityReporting: false,

  technicalNeedIsCapacityBuilding: false,
  applicantEligibleForTechnicalSupport: false,
  technicalSupportNotCashMachinery: false,
  technicalNeedAreaRelevant: false,
  technicalOutputDefined: false,
  technicalTeamDefined: false,

  feasibilityBeforeInvestmentDecision: false,
  feasibilityHasRegionalImpact: false,
  feasibilityRelatedToRegionalOpportunity: false,
  feasibilityThemeRelevant: false,
  feasibilityCanLeadToInvestmentDecision: false,
  feasibilityApplicantEligible: false,
  feasibilityCoFinancePossible: false,
  feasibilityServiceProcurementPlanned: false,
  feasibilityCompletesWithinOneYear: false,

  financeProjectIsPrivateInvestment: false,
  financeNeedExists: false,
  financeFitsAgencyPriorities: false,
  financeViaIntermediaryPossible: false,
  financeRepaymentCapacity: false,
  financeCollateralSuitable: false,
  financeTypeInvestmentOrWorkingCapital: false,
  financeMaturityAndRepaymentPlanReady: false,

  guidedProjectWithStrategicActors: false,
  guidedProjectHighRegionalImpact: false,
  guidedProjectCreatesEcosystemImpact: false,
  guidedProjectBeyondSingleCompany: false,
  guidedProjectGovernanceReady: false,
  guidedProjectNeedsAgencyPreConsultation: false,

  hasKaysUserAccount: false,
  kaysAuthorizedSignatoryReady: false,
  hasSignatureAuthorityDocs: false,
  hasTaxCertificate: false,
  hasTradeRegistryGazette: false,
  hasActivityCertificate: false,
  hasFinancialStatements: false,
  hasApplicationFormDraft: false,
  hasProjectBudgetDraft: false,
  hasPartnerAffiliateDocs: false,
  hasCommitmentLetters: false,
  hasCoFinanceDeclaration: false,
  hasProjectTimeline: false,
  reviewedOpenCallGuideline: false,
});
