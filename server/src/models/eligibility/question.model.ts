import { InferSchemaType, Schema, model } from "mongoose";

const questionSchema = new Schema(
  {
    moduleKey: { type: String, required: true, trim: true, index: true },
    ruleSetVersion: { type: Number, required: true },
    groupCode: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    inputType: { type: String, required: true, enum: ["bool", "select", "number", "text", "multi_select"] },
    options: [
      {
        value: { type: String, required: true },
        label: { type: String, required: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    createdAtUtc: { type: Date, default: () => new Date() },
  },
  { collection: "questions" },
);

questionSchema.index({ moduleKey: 1, ruleSetVersion: 1, code: 1 }, { unique: true });

export type QuestionDocument = InferSchemaType<typeof questionSchema>;
export const QuestionModel = model("Question", questionSchema);
