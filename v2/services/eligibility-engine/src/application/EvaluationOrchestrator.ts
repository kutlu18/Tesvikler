import type { CompanyProfile, SupportEvaluation } from "@v2/shared-types";
import type { RuleProvider } from "../domain/ports/RuleProvider";

export class EvaluationOrchestrator {
  constructor(private readonly ruleProvider: RuleProvider) {}

  run(profile: CompanyProfile): SupportEvaluation[] {
    return this.ruleProvider.evaluate(profile);
  }
}
