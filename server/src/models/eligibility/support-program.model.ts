import { InferSchemaType, Schema, model } from "mongoose";

const supportProgramSchema = new Schema(
  {
    moduleKey: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    legalBasis: { type: String, required: true, trim: true },
    createdAtUtc: { type: Date, default: () => new Date() },
    updatedAtUtc: { type: Date, default: () => new Date() },
  },
  { collection: "support_programs" },
);

supportProgramSchema.index({ moduleKey: 1, code: 1 }, { unique: true });

const recommendationSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    analysisId: { type: Schema.Types.ObjectId, ref: "Analysis", required: true, index: true },
    supportProgramId: { type: Schema.Types.ObjectId, ref: "SupportProgram", required: true },
    status: { type: String, enum: ["UYGUN", "POTANSIYEL", "RISKLI"], required: true },
    reasonSummary: { type: String, required: true },
    riskNote: { type: String, required: true },
    nextAction: { type: String, required: true },
    createdAtUtc: { type: Date, default: () => new Date() },
  },
  { collection: "analysis_recommendations" },
);

recommendationSchema.index({ tenantId: 1, analysisId: 1, supportProgramId: 1 }, { unique: true });

const documentRequirementSchema = new Schema(
  {
    code: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    createdAtUtc: { type: Date, default: () => new Date() },
  },
  { collection: "document_requirements" },
);

const supportProgramDocumentSchema = new Schema(
  {
    supportProgramId: { type: Schema.Types.ObjectId, ref: "SupportProgram", required: true },
    documentRequirementId: { type: Schema.Types.ObjectId, ref: "DocumentRequirement", required: true },
    isMandatory: { type: Boolean, default: true },
  },
  { collection: "support_program_document_requirements" },
);

supportProgramDocumentSchema.index({ supportProgramId: 1, documentRequirementId: 1 }, { unique: true });

export type SupportProgramDocument = InferSchemaType<typeof supportProgramSchema>;
export type AnalysisRecommendationDocument = InferSchemaType<typeof recommendationSchema>;
export type DocumentRequirementDocument = InferSchemaType<typeof documentRequirementSchema>;
export type SupportProgramDocumentRequirementDocument = InferSchemaType<typeof supportProgramDocumentSchema>;

export const SupportProgramModel = model("SupportProgram", supportProgramSchema);
export const AnalysisRecommendationModel = model("AnalysisRecommendation", recommendationSchema);
export const DocumentRequirementModel = model("DocumentRequirement", documentRequirementSchema);
export const SupportProgramDocumentRequirementModel = model("SupportProgramDocumentRequirement", supportProgramDocumentSchema);
