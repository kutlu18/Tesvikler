import { InferSchemaType, Schema, model } from "mongoose";

const inboundEventSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    sourceSystem: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    idempotencyKey: { type: String, required: true, trim: true },
    payload: { type: Schema.Types.Mixed, required: true },
    processedAtUtc: { type: Date, required: false },
    createdAtUtc: { type: Date, default: () => new Date() },
  },
  { collection: "inbound_events" },
);

inboundEventSchema.index({ tenantId: 1, sourceSystem: 1, idempotencyKey: 1 }, { unique: true });

const outboxSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    aggregateType: { type: String, required: true },
    aggregateId: { type: String, required: true },
    eventType: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: { type: String, required: true, enum: ["PENDING", "PUBLISHED", "FAILED"], default: "PENDING" },
    createdAtUtc: { type: Date, default: () => new Date(), index: true },
    publishedAtUtc: { type: Date, required: false },
  },
  { collection: "outbox_messages" },
);

outboxSchema.index({ status: 1, createdAtUtc: 1 });

export type InboundEventDocument = InferSchemaType<typeof inboundEventSchema>;
export type OutboxMessageDocument = InferSchemaType<typeof outboxSchema>;

export const InboundEventModel = model("InboundEvent", inboundEventSchema);
export const OutboxMessageModel = model("OutboxMessage", outboxSchema);
