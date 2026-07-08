import type { Medicine } from "@workspace/db";

export type MedicineStatus = "safe" | "near_expiry" | "expiring_soon" | "expired";

export function computeRemainingDays(expiryDate: string, now: Date = new Date()): number {
  const expiry = new Date(`${expiryDate}T00:00:00Z`);
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const diffMs = expiry.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function computeStatus(remainingDays: number): MedicineStatus {
  if (remainingDays < 0) return "expired";
  if (remainingDays < 30) return "expiring_soon";
  if (remainingDays <= 90) return "near_expiry";
  return "safe";
}

export function withComputedFields(medicine: Medicine, now: Date = new Date()) {
  const remainingDays = computeRemainingDays(medicine.expiryDate, now);
  const status = computeStatus(remainingDays);
  return { ...medicine, remainingDays, status };
}
