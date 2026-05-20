import { InferSchemaType, Schema, model } from "mongoose";

const moduleSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    createdAtUtc: { type: Date, default: () => new Date() },
    updatedAtUtc: { type: Date, default: () => new Date() },
  },
  { collection: "modules" },
);

moduleSchema.index({ key: 1 }, { unique: true });

const ruleSetSchema = new Schema(
  {
    moduleKey: { type: String, required: true, trim: true, index: true },
    version: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdAtUtc: { type: Date, default: () => new Date() },
  },
  { collection: "rule_sets" },
);

ruleSetSchema.index({ moduleKey: 1, version: 1 }, { unique: true });

export type ModuleDocument = InferSchemaType<typeof moduleSchema>;
export type RuleSetDocument = InferSchemaType<typeof ruleSetSchema>;

export const ModuleModel = model("Module", moduleSchema);
export const RuleSetModel = model("RuleSet", ruleSetSchema);
