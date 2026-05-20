import type { CompanyProfile, SupportEvaluation } from "@v2/shared-types";

export interface RuleProvider {
  evaluate(profile: CompanyProfile): SupportEvaluation[];
}
