import { Router, type IRouter } from "express";
import { eq, avg, count, sql } from "drizzle-orm";
import { db, reviewsTable, salonsTable } from "@workspace/db";
import {
  GetSalonReviewsResponse,
  CreateReviewBody,
  GetSalonReviewsParams,
  CreateReviewParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/salons/:id/reviews", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSalonReviewsParams.safeParse({ id: raw });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const reviews = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.salonId, params.data.id))
    .orderBy(sql`created_at desc`);

  res.json(GetSalonReviewsResponse.parse(reviews.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))));
});

router.post("/salons/:id/reviews", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CreateReviewParams.safeParse({ id: rawId });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [review] = await db.insert(reviewsTable).values({
    salonId: params.data.id,
    ...parsed.data,
  }).returning();

  // Update salon rating
  const [stats] = await db.select({
    avgRating: sql<number>`round(avg(rating)::numeric, 1)`,
    reviewCount: sql<number>`count(*)::int`,
  }).from(reviewsTable).where(eq(reviewsTable.salonId, params.data.id));

  await db.update(salonsTable)
    .set({ rating: stats.avgRating, reviewCount: stats.reviewCount })
    .where(eq(salonsTable.id, params.data.id));

  res.status(201).json({ ...review, createdAt: review.createdAt.toISOString() });
});

export default router;
