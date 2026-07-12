import { Router, type IRouter } from "express";
import { MedicineModel } from "@workspace/db";
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

  const filter: Record<string, unknown> = {};

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { name: regex },
      { batchNumber: regex },
      { manufacturer: regex },
    ];
  }

  let sortField = "createdAt";
  let sortDir: 1 | -1 = -1;

  switch (sortBy) {
    case "name":
      sortField = "name";
      sortDir = 1;
      break;
    case "expiryDate":
      sortField = "expiryDate";
      sortDir = 1;
      break;
    case "manufacturer":
      sortField = "manufacturer";
      sortDir = 1;
      break;
    case "quantity":
      sortField = "quantity";
      sortDir = -1;
      break;
    case "createdAt":
    default:
      sortField = "createdAt";
      sortDir = -1;
      break;
  }

  const docs = await MedicineModel.find(filter).sort({ [sortField]: sortDir }).lean();
  let medicines = docs.map((doc: Record<string, unknown>) => withComputedFields(doc));

  if (status) {
    medicines = medicines.filter((m) => m.status === (status as MedicineStatus));
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

  const [doc] = await MedicineModel.create([
    {
      ...rest,
      manufacturingDate: manufacturingDate.toISOString().slice(0, 10),
      expiryDate: expiryDate.toISOString().slice(0, 10),
    },
  ]);

  res.status(201).json(withComputedFields(doc.toJSON() as Record<string, unknown>));
});

router.get("/medicines/lookup/:qrCodeValue", async (req, res): Promise<void> => {
  const params = LookupMedicineByQrCodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const doc = await MedicineModel.findOne({ qrCodeValue: params.data.qrCodeValue }).lean();
  if (!doc) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  res.json(withComputedFields(doc as Record<string, unknown>));
});

router.get("/medicines/:id", async (req, res): Promise<void> => {
  const params = GetMedicineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const doc = await MedicineModel.findById(params.data.id).lean();
  if (!doc) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  res.json(withComputedFields(doc as Record<string, unknown>));
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

  const doc = await MedicineModel.findByIdAndUpdate(
    params.data.id,
    {
      $set: {
        ...rest,
        manufacturingDate: manufacturingDate.toISOString().slice(0, 10),
        expiryDate: expiryDate.toISOString().slice(0, 10),
      },
    },
    { new: true },
  ).lean();

  if (!doc) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  res.json(withComputedFields(doc as Record<string, unknown>));
});

router.delete("/medicines/:id", async (req, res): Promise<void> => {
  const params = DeleteMedicineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const doc = await MedicineModel.findByIdAndDelete(params.data.id).lean();
  if (!doc) {
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

  const docs = await MedicineModel.find()
    .sort({ createdAt: -1 })
    .limit(query.data.limit)
    .lean();

  const medicines = docs.map((doc: Record<string, unknown>) => withComputedFields(doc));

  res.json(medicines);
});

export default router;
