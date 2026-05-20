import { Schema, model, type InferSchemaType, Types } from "mongoose";

const opportunitySchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
    moduleCode: { type: String, required: true, index: true },
    supportCode: { type: String, required: true },
    status: { type: String, enum: ["eligible", "potential", "risky"], required: true },
    score: { type: Number, default: 0 },
    notes: { type: [String], default: [] },
  },
  { timestamps: true }
);

opportunitySchema.index({ companyId: 1, moduleCode: 1, supportCode: 1 }, { unique: true });

export type OpportunityDocument = InferSchemaType<typeof opportunitySchema>;
export const OpportunityModel = model("Opportunity", opportunitySchema);
