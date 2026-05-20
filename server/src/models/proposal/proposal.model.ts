import { InferSchemaType, Schema, model } from "mongoose";
import { withBaseFields } from "../common.js";

const opportunitySchema = new Schema(
  withBaseFields({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    title: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ["NEW", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"], default: "NEW" },
    sourceAnalysisId: { type: Schema.Types.ObjectId, ref: "Analysis", required: false },
  }),
  { collection: "opportunities" },
);

const proposalSchema = new Schema(
  withBaseFields({
    opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity", required: true, index: true },
    proposalNo: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ["DRAFT", "SENT", "APPROVED", "REJECTED"], default: "DRAFT" },
  }),
  { collection: "proposals" },
);

proposalSchema.index({ tenantId: 1, proposalNo: 1 }, { unique: true });

const proposalVersionSchema = new Schema(
  withBaseFields({
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true, index: true },
    versionNo: { type: Number, required: true },
    snapshotJson: { type: Schema.Types.Mixed, required: true },
  }),
  { collection: "proposal_versions" },
);

proposalVersionSchema.index({ tenantId: 1, proposalId: 1, versionNo: 1 }, { unique: true });

export type OpportunityDocument = InferSchemaType<typeof opportunitySchema>;
export type ProposalDocument = InferSchemaType<typeof proposalSchema>;
export type ProposalVersionDocument = InferSchemaType<typeof proposalVersionSchema>;

export const OpportunityModel = model("Opportunity", opportunitySchema);
export const ProposalModel = model("Proposal", proposalSchema);
export const ProposalVersionModel = model("ProposalVersion", proposalVersionSchema);
