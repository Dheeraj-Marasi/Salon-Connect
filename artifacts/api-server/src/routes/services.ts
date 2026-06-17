import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, servicesTable } from "@workspace/db";
import {
  ListServicesResponse,
  GetSalonServicesResponse,
  CreateServiceBody,
  ListServicesQueryParams,
  GetSalonServicesParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/salons/:id/services", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSalonServicesParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const services = await db.select().from(servicesTable).where(eq(servicesTable.salonId, params.data.id));
  res.json(GetSalonServicesResponse.parse(services));
});

router.get("/services", async (req, res): Promise<void> => {
  const parsed = ListServicesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category } = parsed.data;
  const services = category
    ? await db.select().from(servicesTable).where(eq(servicesTable.category, category))
    : await db.select().from(servicesTable);
  res.json(ListServicesResponse.parse(services));
});

router.post("/services", async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [service] = await db.insert(servicesTable).values(parsed.data).returning();
  res.status(201).json(service);
});

export default router;
