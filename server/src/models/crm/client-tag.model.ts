import { InferSchemaType, Schema, model } from "mongoose";
import { withBaseFields } from "../common.js";

const clientTagSchema = new Schema(
  withBaseFields({
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  }),
  { collection: "client_tags" },
);

clientTagSchema.index({ tenantId: 1, code: 1 }, { unique: true });

const clientTagMapSchema = new Schema(
  withBaseFields({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    tagId: { type: Schema.Types.ObjectId, ref: "ClientTag", required: true },
  }),
  { collection: "client_tag_map" },
);

clientTagMapSchema.index({ tenantId: 1, clientId: 1, tagId: 1 }, { unique: true });

export type ClientTagDocument = InferSchemaType<typeof clientTagSchema>;
export type ClientTagMapDocument = InferSchemaType<typeof clientTagMapSchema>;

export const ClientTagModel = model("ClientTag", clientTagSchema);
export const ClientTagMapModel = model("ClientTagMap", clientTagMapSchema);
