import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { salonsTable } from "./salons";
import { servicesTable } from "./services";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").notNull().references(() => salonsTable.id),
  salonName: text("salon_name").notNull(),
  serviceId: integer("service_id").notNull().references(() => servicesTable.id),
  serviceName: text("service_name").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").notNull().default("pending"),
  totalPrice: real("total_price").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
