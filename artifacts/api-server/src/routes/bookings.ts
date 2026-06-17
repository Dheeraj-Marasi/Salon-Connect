import { Router, type IRouter } from "express";
import { eq, and, like, sql } from "drizzle-orm";
import { db, bookingsTable, servicesTable, salonsTable } from "@workspace/db";
import {
  ListBookingsResponse,
  GetBookingResponse,
  CreateBookingBody,
  UpdateBookingStatusBody,
  ListBookingsQueryParams,
  GetBookingParams,
  UpdateBookingStatusParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bookings", async (req, res): Promise<void> => {
  const parsed = ListBookingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { salonId, customerName } = parsed.data;
  const conditions = [];
  if (salonId) conditions.push(eq(bookingsTable.salonId, salonId));
  if (customerName) conditions.push(like(bookingsTable.customerName, `%${customerName}%`));

  const bookings = await db.select().from(bookingsTable).where(and(...conditions)).orderBy(sql`created_at desc`);
  res.json(ListBookingsResponse.parse(bookings.map(b => ({ ...b, createdAt: b.createdAt.toISOString() }))));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { salonId, serviceId, customerName, customerPhone, appointmentDate, appointmentTime, notes } = parsed.data;

  const [salon] = await db.select().from(salonsTable).where(eq(salonsTable.id, salonId));
  if (!salon) { res.status(404).json({ error: "Salon not found" }); return; }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId));
  if (!service) { res.status(404).json({ error: "Service not found" }); return; }

  const [booking] = await db.insert(bookingsTable).values({
    salonId,
    salonName: salon.name,
    serviceId,
    serviceName: service.name,
    customerName,
    customerPhone,
    appointmentDate,
    appointmentTime,
    status: "confirmed",
    totalPrice: service.price,
    notes: notes ?? null,
  }).returning();

  res.status(201).json({ ...booking, createdAt: booking.createdAt.toISOString() });
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetBookingParams.safeParse({ id: raw });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }

  res.json(GetBookingResponse.parse({ ...booking, createdAt: booking.createdAt.toISOString() }));
});

router.patch("/bookings/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateBookingStatusParams.safeParse({ id: rawId });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [booking] = await db.update(bookingsTable)
    .set({ status: parsed.data.status })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();

  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }

  res.json({ ...booking, createdAt: booking.createdAt.toISOString() });
});

export default router;
