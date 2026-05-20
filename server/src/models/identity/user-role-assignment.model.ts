import { InferSchemaType, Schema, model } from "mongoose";
import { withBaseFields } from "../common.js";

const assignmentSchema = new Schema(
  withBaseFields({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  }),
  { collection: "user_role_assignments" },
);

assignmentSchema.index({ tenantId: 1, userId: 1, roleId: 1 }, { unique: true });

export type UserRoleAssignmentDocument = InferSchemaType<typeof assignmentSchema>;
export const UserRoleAssignmentModel = model("UserRoleAssignment", assignmentSchema);
