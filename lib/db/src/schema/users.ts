import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>) {
        ret.id = (ret._id as string).toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
  },
);

export const UserModel = mongoose.model("User", userSchema);
