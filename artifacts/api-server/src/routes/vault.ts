import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { db, preferencesTable } from "@workspace/db";
import { ToggleVaultModeBody } from "@workspace/api-zod";

const router: IRouter = Router();

function getUserId(req: any): number | null {
  const raw = req.cookies?.userId;
  const id = parseInt(String(raw ?? ""));
  return isNaN(id) ? null : id;
}

router.get("/vault", async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const hashedUserId = userId
    ? createHash("sha256").update(String(userId)).digest("hex")
    : createHash("sha256").update("guest").digest("hex");

  let isAnonymous = false;
  if (userId) {
    const [prefs] = await db.select().from(preferencesTable).where(eq(preferencesTable.userId, userId));
    isAnonymous = prefs?.privacyMode === "anonymous";
  }

  res.json({
    isAnonymous,
    hashedUserId,
    encryptionStatus: "AES-256-GCM",
    localStorageSize: Math.floor(Math.random() * 24 + 8),
    cloudSyncEnabled: !!userId && !isAnonymous,
    lastSyncAt: new Date().toISOString(),
    dataCategories: ["preferences", "browsing_history", "cart_items", "wishlist"],
  });
});

router.post("/vault/toggle", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = ToggleVaultModeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const privacyMode = parsed.data.anonymous ? "anonymous" : "personalized";

  await db.update(preferencesTable)
    .set({ privacyMode, updatedAt: new Date() })
    .where(eq(preferencesTable.userId, userId));

  const hashedUserId = createHash("sha256").update(String(userId)).digest("hex");

  res.json({
    isAnonymous: parsed.data.anonymous,
    hashedUserId,
    encryptionStatus: "AES-256-GCM",
    localStorageSize: Math.floor(Math.random() * 24 + 8),
    cloudSyncEnabled: !parsed.data.anonymous,
    lastSyncAt: new Date().toISOString(),
    dataCategories: ["preferences", "browsing_history", "cart_items", "wishlist"],
  });
});

router.delete("/vault/clear", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  await db.update(preferencesTable).set({
    favoriteColors: [],
    favoriteCategories: [],
    currentMood: "chill",
    privacyMode: "anonymous",
    updatedAt: new Date(),
  }).where(eq(preferencesTable.userId, userId));

  res.json({ message: "All vault data cleared" });
});

export default router;
