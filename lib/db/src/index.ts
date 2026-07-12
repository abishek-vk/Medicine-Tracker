import mongoose from "mongoose";

const MONGO_URI: string = process.env.DATABASE_URL ?? "";

if (!MONGO_URI) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

let isConnected = false;

export async function connectDb(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "medicine-tracker",
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}

export async function disconnectDb(): Promise<void> {
  if (!isConnected) return;

  await mongoose.disconnect();
  isConnected = false;
}

export * from "./schema";
