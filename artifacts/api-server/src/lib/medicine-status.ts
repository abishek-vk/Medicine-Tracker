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

export interface NormalizedMedicine {
  id: string;
  name: string;
  batchNumber: string;
  manufacturer: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  storageLocation: string;
  category: string;
  qrCodeValue: string;
  createdAt: Date;
  [key: string]: unknown;
}

export interface MedicineRecord extends NormalizedMedicine {
  remainingDays: number;
  status: MedicineStatus;
}

export function normalizeDoc(doc: Record<string, unknown>): NormalizedMedicine {
  return {
    id: (doc._id ?? doc.id)?.toString() ?? "",
    name: doc.name as string,
    batchNumber: doc.batchNumber as string,
    manufacturer: doc.manufacturer as string,
    manufacturingDate: doc.manufacturingDate as string,
    expiryDate: doc.expiryDate as string,
    quantity: doc.quantity as number,
    storageLocation: doc.storageLocation as string,
    category: doc.category as string,
    qrCodeValue: doc.qrCodeValue as string,
    createdAt: doc.createdAt as Date ?? new Date(),
  };
}

export function withComputedFields(medicine: Record<string, unknown>, now: Date = new Date()): MedicineRecord {
  const norm = normalizeDoc(medicine);
  const remainingDays = computeRemainingDays(norm.expiryDate, now);
  const status = computeStatus(remainingDays);
  return { ...norm, remainingDays, status };
}
