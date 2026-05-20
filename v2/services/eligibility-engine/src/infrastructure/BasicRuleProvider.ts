import { EligibilityStatus, type CompanyProfile, type SupportEvaluation } from "@v2/shared-types";
import type { RuleProvider } from "../domain/ports/RuleProvider";

export class BasicRuleProvider implements RuleProvider {
  evaluate(profile: CompanyProfile): SupportEvaluation[] {
    const baseStatus = profile.isTurkeyResident ? EligibilityStatus.POTENTIAL : EligibilityStatus.RISKY;

    return [
      {
        code: "GEN-001",
        name: "Genel On Uygunluk",
        status: profile.isSme ? EligibilityStatus.ELIGIBLE : baseStatus,
        whyEligible: profile.isSme ? ["Firma KOBI statusu on kosulunu sagliyor."] : [],
        whyNotEligible: profile.isSme ? [] : ["KOBI bilgisi net degil veya uygun degil."],
        actions: ["Modul bazli detay soru setini doldurun."],
        requiredDocuments: ["Vergi levhasi", "Ticaret sicil gazetesi"],
      },
    ];
  }
}
