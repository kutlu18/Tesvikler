import { Schema } from "mongoose";

export const baseFields = {
  tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
  createdAtUtc: { type: Date, default: () => new Date() },
  updatedAtUtc: { type: Date, default: () => new Date() },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  isDeleted: { type: Boolean, default: false, index: true },
};

export function withBaseFields(definition: Record<string, unknown>): Record<string, unknown> {
  return {
    ...definition,
    ...baseFields,
  };
}
