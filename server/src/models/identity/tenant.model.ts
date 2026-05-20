import { InferSchemaType, Schema, model } from "mongoose";

const tenantSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    createdAtUtc: { type: Date, default: () => new Date() },
    updatedAtUtc: { type: Date, default: () => new Date() },
  },
  { collection: "tenants" },
);

tenantSchema.index({ code: 1 }, { unique: true });

export type TenantDocument = InferSchemaType<typeof tenantSchema>;
export const TenantModel = model("Tenant", tenantSchema);
