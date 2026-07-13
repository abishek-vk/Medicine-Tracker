import { Router, type IRouter } from "express";
import { MedicineModel } from "@workspace/db";
import { withComputedFields, type MedicineRecord } from "../lib/medicine-status";
import type { AuthPayload } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const userId = ((req as unknown as { user: AuthPayload }).user).userId;
  const docs = await MedicineModel.find({ userId }).lean();
  const medicines: MedicineRecord[] = docs.map((doc: Record<string, unknown>) => withComputedFields(doc));

  const summary = {
    total: medicines.length,
    safe: medicines.filter((m) => m.status === "safe").length,
    nearExpiry: medicines.filter((m) => m.status === "near_expiry").length,
    expiringSoon: medicines.filter((m) => m.status === "expiring_soon").length,
    expired: medicines.filter((m) => m.status === "expired").length,
  };

  res.json(summary);
});

router.get("/reports/summary", async (req, res): Promise<void> => {
  const userId = ((req as unknown as { user: AuthPayload }).user).userId;
  const docs = await MedicineModel.find({ userId }).lean();
  const medicines = docs.map((doc: Record<string, unknown>) => withComputedFields(doc));

  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  const expiringThisMonth = medicines.filter((m) => {
    const expiry = new Date(`${m.expiryDate}T00:00:00Z`);
    return (
      expiry.getUTCMonth() === currentMonth &&
      expiry.getUTCFullYear() === currentYear &&
      m.status !== "expired"
    );
  }).length;

  const totalQuantity = medicines.reduce((sum, m) => sum + m.quantity, 0);

  const monthlyMap = new Map<string, number>();
  for (const m of medicines) {
    const expiry = new Date(`${m.expiryDate}T00:00:00Z`);
    const key = expiry.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
  }

  const monthlySummary = Array.from(monthlyMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  res.json({
    expiringThisMonth,
    expired: medicines.filter((m) => m.status === "expired").length,
    total: medicines.length,
    safe: medicines.filter((m) => m.status === "safe").length,
    nearExpiry: medicines.filter((m) => m.status === "near_expiry").length,
    totalQuantity,
    monthlySummary,
  });
});

export default router;
