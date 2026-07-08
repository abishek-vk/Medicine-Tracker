import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, medicinesTable } from "@workspace/db";
import {
  CreateMedicineBody,
  UpdateMedicineBody,
  GetMedicineParams,
  UpdateMedicineParams,
  DeleteMedicineParams,
  LookupMedicineByQrCodeParams,
  ListMedicinesQueryParams,
  GetRecentMedicinesQueryParams,
} from "@workspace/api-zod";
import { withComputedFields, type MedicineStatus } from "../lib/medicine-status";

const router: IRouter = Router();

router.get("/medicines", async (req, res): Promise<void> => {
  const query = ListMedicinesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { search, status, sortBy } = query.data;

  const conditions = search
    ? or(
        ilike(medicinesTable.name, `%${search}%`),
        ilike(medicinesTable.batchNumber, `%${search}%`),
        ilike(medicinesTable.manufacturer, `%${search}%`),
      )
    : undefined;

  const rows = conditions
    ? await db.select().from(medicinesTable).where(conditions)
    : await db.select().from(medicinesTable);

  let medicines = rows.map((row) => withComputedFields(row));

  if (status) {
    medicines = medicines.filter((m) => m.status === (status as MedicineStatus));
  }

  switch (sortBy) {
    case "name":
      medicines.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "expiryDate":
      medicines.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
      break;
    case "manufacturer":
      medicines.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));
      break;
    case "quantity":
      medicines.sort((a, b) => b.quantity - a.quantity);
      break;
    case "createdAt":
    default:
      medicines.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
  }

  res.json(medicines);
});

router.post("/medicines", async (req, res): Promise<void> => {
  const parsed = CreateMedicineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { manufacturingDate, expiryDate, ...rest } = parsed.data;

  const [medicine] = await db
    .insert(medicinesTable)
    .values({
      ...rest,
      manufacturingDate: manufacturingDate.toISOString().slice(0, 10),
      expiryDate: expiryDate.toISOString().slice(0, 10),
    })
    .returning();

  res.status(201).json(withComputedFields(medicine));
});

router.get("/medicines/lookup/:qrCodeValue", async (req, res): Promise<void> => {
  const params = LookupMedicineByQrCodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [medicine] = await db
    .select()
    .from(medicinesTable)
    .where(eq(medicinesTable.qrCodeValue, params.data.qrCodeValue));

  if (!medicine) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  res.json(withComputedFields(medicine));
});

router.get("/medicines/:id", async (req, res): Promise<void> => {
  const params = GetMedicineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [medicine] = await db
    .select()
    .from(medicinesTable)
    .where(eq(medicinesTable.id, params.data.id));

  if (!medicine) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  res.json(withComputedFields(medicine));
});

router.put("/medicines/:id", async (req, res): Promise<void> => {
  const params = UpdateMedicineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMedicineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { manufacturingDate, expiryDate, ...rest } = parsed.data;

  const [medicine] = await db
    .update(medicinesTable)
    .set({
      ...rest,
      manufacturingDate: manufacturingDate.toISOString().slice(0, 10),
      expiryDate: expiryDate.toISOString().slice(0, 10),
    })
    .where(eq(medicinesTable.id, params.data.id))
    .returning();

  if (!medicine) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  res.json(withComputedFields(medicine));
});

router.delete("/medicines/:id", async (req, res): Promise<void> => {
  const params = DeleteMedicineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [medicine] = await db
    .delete(medicinesTable)
    .where(eq(medicinesTable.id, params.data.id))
    .returning();

  if (!medicine) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/dashboard/recent", async (req, res): Promise<void> => {
  const query = GetRecentMedicinesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db.select().from(medicinesTable);
  const medicines = rows
    .map((row) => withComputedFields(row))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, query.data.limit);

  res.json(medicines);
});

export default router;
