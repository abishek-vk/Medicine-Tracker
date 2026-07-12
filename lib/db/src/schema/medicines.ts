import mongoose, { Schema } from "mongoose";

const medicineSchema = new Schema(
  {
    name: { type: String, required: true },
    batchNumber: { type: String, required: true },
    manufacturer: { type: String, required: true },
    manufacturingDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
    quantity: { type: Number, required: true },
    storageLocation: { type: String, required: true },
    category: { type: String, required: true },
    qrCodeValue: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    toJSON: {
      virtuals: true,
      transform(_doc: unknown, ret: Record<string, unknown>) {
        (ret as Record<string, unknown>).id = ((ret as Record<string, unknown>)._id as string).toString();
        delete (ret as Record<string, unknown>)._id;
        delete (ret as Record<string, unknown>).__v;
      },
    },
  },
);

export const MedicineModel = mongoose.model("Medicine", medicineSchema);
