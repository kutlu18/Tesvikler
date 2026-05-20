import { InferSchemaType, Schema, model } from "mongoose";
import { withBaseFields } from "../common.js";

const analysisSchema = new Schema(
  withBaseFields({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    moduleKey: { type: String, required: true, trim: true, index: true },
    ruleSetVersion: { type: Number, required: true },
    suitabilityScore: { type: Number, required: false },
    summaryJson: { type: Schema.Types.Mixed, required: false },
  }),
  { collection: "analyses" },
);

analysisSchema.index({ tenantId: 1, clientId: 1, moduleKey: 1, createdAtUtc: -1 });

const answerSchema = new Schema(
  withBaseFields({
    analysisId: { type: Schema.Types.ObjectId, ref: "Analysis", required: true, index: true },
    questionCode: { type: String, required: true, trim: true },
    valueText: { type: String, required: false },
    valueNumber: { type: Number, required: false },
    valueBool: { type: Boolean, required: false },
    valueJson: { type: Schema.Types.Mixed, required: false },
  }),
  { collection: "analysis_answers" },
);

answerSchema.index({ tenantId: 1, analysisId: 1, questionCode: 1 }, { unique: true });

export type AnalysisDocument = InferSchemaType<typeof analysisSchema>;
export type AnalysisAnswerDocument = InferSchemaType<typeof answerSchema>;

export const AnalysisModel = model("Analysis", analysisSchema);
export const AnalysisAnswerModel = model("AnalysisAnswer", answerSchema);
