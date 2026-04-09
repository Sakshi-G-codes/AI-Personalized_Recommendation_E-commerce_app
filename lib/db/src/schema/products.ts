import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  mood: text("mood").notNull().default("chill"),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.0"),
  reviewCount: integer("review_count").notNull().default(0),
  trustScore: numeric("trust_score", { precision: 5, scale: 1 }).notNull().default("75"),
  regretPercent: numeric("regret_percent", { precision: 4, scale: 1 }).notNull().default("5"),
  colors: text("colors").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  aiReason: text("ai_reason"),
  isLocalData: boolean("is_local_data").notNull().default(false),
  inStock: boolean("in_stock").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
