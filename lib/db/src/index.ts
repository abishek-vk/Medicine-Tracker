import mongoose from "mongoose";

const MONGO_URI =
  process.env["DATABASE_URL"] ??
  "mongodb+srv://deepika:eaWMa2tBxMN0daqO@cluster0.hov085v.mongodb.net/medicine-tracker?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGO_URI) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let isConnected = false;

export async function connectDb(): Promise<void> {
  if (isConnected) return;
  await mongoose.connect(MONGO_URI, {
    dbName: "medicine-tracker",
    authSource: "admin",
  });
  isConnected = true;
}

export async function disconnectDb(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}

export * from "./schema";
