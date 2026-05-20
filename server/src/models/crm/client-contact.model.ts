import { InferSchemaType, Schema, model } from "mongoose";
import { withBaseFields } from "../common.js";

const contactSchema = new Schema(
  withBaseFields({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    title: { type: String, trim: true },
  }),
  { collection: "client_contacts" },
);

contactSchema.index({ tenantId: 1, clientId: 1 });

export type ClientContactDocument = InferSchemaType<typeof contactSchema>;
export const ClientContactModel = model("ClientContact", contactSchema);
