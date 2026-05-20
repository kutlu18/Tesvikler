import { InferSchemaType, Schema, model } from "mongoose";
import { withBaseFields } from "../common.js";

const externalRefSchema = new Schema(
  withBaseFields({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    externalSystem: { type: String, required: true, trim: true },
    externalId: { type: String, required: true, trim: true },
    payloadHash: { type: String, trim: true },
  }),
  { collection: "client_external_refs" },
);

externalRefSchema.index({ tenantId: 1, externalSystem: 1, externalId: 1 }, { unique: true });
externalRefSchema.index({ tenantId: 1, clientId: 1 });

export type ClientExternalRefDocument = InferSchemaType<typeof externalRefSchema>;
export const ClientExternalRefModel = model("ClientExternalRef", externalRefSchema);
