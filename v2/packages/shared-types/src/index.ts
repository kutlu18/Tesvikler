export type RecordId = string;

export enum EligibilityStatus {
  ELIGIBLE = "eligible",
  POTENTIAL = "potential",
  RISKY = "risky",
}

export interface ScoreSummary {
  value: number;
  label: string;
}

export interface SupportEvaluation {
  code: string;
  name: string;
  status: EligibilityStatus;
  whyEligible: string[];
  whyNotEligible: string[];
  actions: string[];
  requiredDocuments: string[];
}

export interface CompanyProfile {
  companyId: RecordId;
  legalType: "sole" | "limited" | "joint-stock" | "cooperative" | "other";
  isTurkeyResident: boolean;
  isSme: boolean;
  sectorCode?: string;
}
