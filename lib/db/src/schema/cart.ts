import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true, createdAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItemsTable.$inferSelect;
