import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const preferencesTable = pgTable("preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull().unique(),
  favoriteColors: text("favorite_colors").array().notNull().default([]),
  favoriteCategories: text("favorite_categories").array().notNull().default([]),
  currentMood: text("current_mood").notNull().default("chill"),
  privacyMode: text("privacy_mode").notNull().default("personalized"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPreferencesSchema = createInsertSchema(preferencesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;
export type Preferences = typeof preferencesTable.$inferSelect;
