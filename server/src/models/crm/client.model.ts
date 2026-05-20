import { InferSchemaType, Schema, model } from "mongoose";
import { withBaseFields } from "../common.js";

const clientSchema = new Schema(
  withBaseFields({
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    taxNumber: { type: String, required: true, trim: true },
    mersisNo: { type: String, trim: true },
    segment: { type: String, trim: true },
  }),
  { collection: "clients" },
);

clientSchema.index({ tenantId: 1, code: 1 }, { unique: true });
clientSchema.index({ tenantId: 1, taxNumber: 1 }, { unique: true });

export type ClientDocument = InferSchemaType<typeof clientSchema>;
export const ClientModel = model("Client", clientSchema);
