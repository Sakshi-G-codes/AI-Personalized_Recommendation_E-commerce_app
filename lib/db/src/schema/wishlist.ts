import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const wishlistTable = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWishlistSchema = createInsertSchema(wishlistTable).omit({ id: true, createdAt: true });
export type InsertWishlistItem = z.infer<typeof insertWishlistSchema>;
export type WishlistItem = typeof wishlistTable.$inferSelect;
