import { InferSchemaType, Schema, model } from "mongoose";
import { withBaseFields } from "../common.js";

const roleSchema = new Schema(
  withBaseFields({
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  }),
  { collection: "roles" },
);

roleSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export type RoleDocument = InferSchemaType<typeof roleSchema>;
export const RoleModel = model("Role", roleSchema);
