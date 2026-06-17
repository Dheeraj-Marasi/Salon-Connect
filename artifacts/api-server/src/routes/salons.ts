import { Router, type IRouter } from "express";
import { eq, like, and, gte, sql } from "drizzle-orm";
import { db, salonsTable, salonCategoriesTable, servicesTable, reviewsTable, salonGalleryTable } from "@workspace/db";
import {
  ListSalonsResponse,
  GetSalonResponse,
  GetFeaturedSalonsResponse,
  GetSalonStatsResponse,
  CreateSalonBody,
  ListSalonsQueryParams,
  GetSalonParams,
  ListAreasResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/salons/featured", async (_req, res): Promise<void> => {
  const featured = await db.select().from(salonsTable).where(eq(salonsTable.featured, true)).limit(6);
  const result = await Promise.all(featured.map(async (s) => {
    const cats = await db.select().from(salonCategoriesTable).where(eq(salonCategoriesTable.salonId, s.id));
    return { ...s, categories: cats.map(c => c.category) };
  }));
  res.json(GetFeaturedSalonsResponse.parse(result));
});

router.get("/salons/stats", async (_req, res): Promise<void> => {
  const [salonCount] = await db.select({ count: sql<number>`count(*)::int` }).from(salonsTable);
  const [serviceCount] = await db.select({ count: sql<number>`count(*)::int` }).from(servicesTable);
  const [bookingCount] = await db.select({ count: sql<number>`count(*)::int` }).from(
    (await import("@workspace/db")).bookingsTable
  );
  const [avgRow] = await db.select({ avg: sql<string>`round(avg(rating)::numeric, 1)` }).from(salonsTable);

  const areaRows = await db.select({
    name: salonsTable.area,
    salonCount: sql<number>`count(*)::int`
  }).from(salonsTable).groupBy(salonsTable.area).orderBy(sql`count(*) desc`).limit(5);

  res.json(GetSalonStatsResponse.parse({
    totalSalons: salonCount.count,
    totalServices: serviceCount.count,
    totalBookings: bookingCount.count,
    avgRating: parseFloat(String(avgRow.avg ?? "0")),
    topAreas: areaRows,
  }));
});

router.get("/salons", async (req, res): Promise<void> => {
  const parsed = ListSalonsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, area, search, minRating } = parsed.data;

  const conditions = [];
  if (area) conditions.push(eq(salonsTable.area, area));
  if (search) conditions.push(like(salonsTable.name, `%${search}%`));
  if (minRating) conditions.push(gte(salonsTable.rating, minRating));

  let salons = await db.select().from(salonsTable).where(and(...conditions));

  if (category) {
    const salonIdsWithCat = await db.select({ salonId: salonCategoriesTable.salonId })
      .from(salonCategoriesTable)
      .where(eq(salonCategoriesTable.category, category));
    const ids = salonIdsWithCat.map(r => r.salonId);
    salons = salons.filter(s => ids.includes(s.id));
  }

  const result = await Promise.all(salons.map(async (s) => {
    const cats = await db.select().from(salonCategoriesTable).where(eq(salonCategoriesTable.salonId, s.id));
    return { ...s, categories: cats.map(c => c.category) };
  }));

  res.json(ListSalonsResponse.parse(result));
});

router.post("/salons", async (req, res): Promise<void> => {
  const parsed = CreateSalonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { categories, ...salonData } = parsed.data as typeof parsed.data & { categories?: string[] };
  const [salon] = await db.insert(salonsTable).values(salonData as Parameters<typeof db.insert>[0] extends infer T ? any : any).returning();
  res.status(201).json({ ...salon, categories: categories ?? [] });
});

router.get("/salons/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetSalonParams.safeParse({ id: raw });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [salon] = await db.select().from(salonsTable).where(eq(salonsTable.id, parsed.data.id));
  if (!salon) {
    res.status(404).json({ error: "Salon not found" });
    return;
  }

  const cats = await db.select().from(salonCategoriesTable).where(eq(salonCategoriesTable.salonId, salon.id));
  const services = await db.select().from(servicesTable).where(eq(servicesTable.salonId, salon.id));
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.salonId, salon.id)).orderBy(reviewsTable.createdAt);
  const gallery = await db.select().from(salonGalleryTable).where(eq(salonGalleryTable.salonId, salon.id));

  res.json(GetSalonResponse.parse({
    ...salon,
    categories: cats.map(c => c.category),
    services,
    reviews: reviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
    gallery: gallery.map(g => g.imageUrl),
  }));
});

router.get("/areas", async (_req, res): Promise<void> => {
  const areaRows = await db.select({
    name: salonsTable.area,
    salonCount: sql<number>`count(*)::int`
  }).from(salonsTable).groupBy(salonsTable.area).orderBy(sql`count(*) desc`);

  res.json(ListAreasResponse.parse(areaRows));
});

export default router;
