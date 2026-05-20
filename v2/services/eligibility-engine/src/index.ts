import { EvaluationOrchestrator } from "./application/EvaluationOrchestrator";
import { BasicRuleProvider } from "./infrastructure/BasicRuleProvider";

const engine = new EvaluationOrchestrator(new BasicRuleProvider());

const result = engine.run({
  companyId: "demo-company",
  legalType: "limited",
  isTurkeyResident: true,
  isSme: true,
  sectorCode: "62.01",
});

// eslint-disable-next-line no-console
console.log("[eligibility-engine] sample evaluation", result);
