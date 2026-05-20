import { InferSchemaType, Schema, model } from "mongoose";
import { withBaseFields } from "../common.js";

const userSchema = new Schema(
  withBaseFields({
    email: { type: String, required: true, trim: true, lowercase: true },
    fullName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  }),
  { collection: "users" },
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel = model("User", userSchema);
