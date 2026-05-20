import { Schema, model, type InferSchemaType } from "mongoose";

const companySchema = new Schema(
  {
    crmClientId: { type: String, required: true, index: true },
    legalName: { type: String, required: true },
    taxNumber: { type: String, required: true, unique: true },
    isSme: { type: Boolean, default: false },
    countryCode: { type: String, default: "TR" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type CompanyDocument = InferSchemaType<typeof companySchema>;
export const CompanyModel = model("Company", companySchema);
