import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, preferencesTable } from "@workspace/db";
import { UpdatePreferencesBody } from "@workspace/api-zod";

const router: IRouter = Router();

function getUserId(req: any): number | null {
  const raw = req.cookies?.userId;
  const id = parseInt(String(raw ?? ""));
  return isNaN(id) ? null : id;
}

router.get("/preferences", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.json({
      id: 0,
      userId: 0,
      favoriteColors: [],
      favoriteCategories: [],
      currentMood: "chill",
      privacyMode: "personalized",
    });
    return;
  }

  let [prefs] = await db.select().from(preferencesTable).where(eq(preferencesTable.userId, userId));

  if (!prefs) {
    const [created] = await db.insert(preferencesTable).values({
      userId,
      favoriteColors: [],
      favoriteCategories: [],
      currentMood: "chill",
      privacyMode: "personalized",
    }).returning();
    prefs = created;
  }

  res.json({
    id: prefs.id,
    userId: prefs.userId,
    favoriteColors: prefs.favoriteColors ?? [],
    favoriteCategories: prefs.favoriteCategories ?? [],
    currentMood: prefs.currentMood,
    privacyMode: prefs.privacyMode,
  });
});

router.put("/preferences", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = UpdatePreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = { updatedAt: new Date() };
  if (parsed.data.favoriteColors !== undefined) updateData.favoriteColors = parsed.data.favoriteColors;
  if (parsed.data.favoriteCategories !== undefined) updateData.favoriteCategories = parsed.data.favoriteCategories;
  if (parsed.data.currentMood !== undefined) updateData.currentMood = parsed.data.currentMood;
  if (parsed.data.privacyMode !== undefined) updateData.privacyMode = parsed.data.privacyMode;

  const [existing] = await db.select().from(preferencesTable).where(eq(preferencesTable.userId, userId));

  let prefs;
  if (existing) {
    const [updated] = await db.update(preferencesTable)
      .set(updateData)
      .where(eq(preferencesTable.userId, userId))
      .returning();
    prefs = updated;
  } else {
    const [created] = await db.insert(preferencesTable).values({
      userId,
      favoriteColors: parsed.data.favoriteColors ?? [],
      favoriteCategories: parsed.data.favoriteCategories ?? [],
      currentMood: parsed.data.currentMood ?? "chill",
      privacyMode: parsed.data.privacyMode ?? "personalized",
    }).returning();
    prefs = created;
  }

  res.json({
    id: prefs.id,
    userId: prefs.userId,
    favoriteColors: prefs.favoriteColors ?? [],
    favoriteCategories: prefs.favoriteCategories ?? [],
    currentMood: prefs.currentMood,
    privacyMode: prefs.privacyMode,
  });
});

export default router;
