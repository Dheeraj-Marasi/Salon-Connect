import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const salonsTable = pgTable("salons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  description: text("description"),
  imageUrl: text("image_url").notNull().default(""),
  priceRange: text("price_range").notNull().default("₹₹"),
  openingTime: text("opening_time").default("09:00"),
  closingTime: text("closing_time").default("20:00"),
  openNow: boolean("open_now").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  rating: real("rating").notNull().default(4.0),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const salonCategoriesTable = pgTable("salon_categories", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").notNull().references(() => salonsTable.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
});

export const salonGalleryTable = pgTable("salon_gallery", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").notNull().references(() => salonsTable.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
});

export const insertSalonSchema = createInsertSchema(salonsTable).omit({ id: true, createdAt: true, rating: true, reviewCount: true });
export type InsertSalon = z.infer<typeof insertSalonSchema>;
export type Salon = typeof salonsTable.$inferSelect;
