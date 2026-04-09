import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, wishlistTable, productsTable } from "@workspace/db";
import { AddToWishlistBody, RemoveFromWishlistParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    imageUrl: p.imageUrl,
    category: p.category,
    mood: p.mood,
    rating: parseFloat(p.rating),
    reviewCount: p.reviewCount,
    trustScore: parseFloat(p.trustScore),
    regretPercent: parseFloat(p.regretPercent),
    colors: p.colors ?? [],
    tags: p.tags ?? [],
    aiReason: p.aiReason,
    isLocalData: p.isLocalData,
    inStock: p.inStock,
  };
}

function getUserId(req: any): number | null {
  const raw = req.cookies?.userId;
  const id = parseInt(String(raw ?? ""));
  return isNaN(id) ? null : id;
}

router.get("/wishlist", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.json([]);
    return;
  }

  const items = await db.select().from(wishlistTable)
    .leftJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
    .where(eq(wishlistTable.userId, userId));

  res.json(items.filter((r) => r.products).map((r) => formatProduct(r.products)));
});

router.post("/wishlist", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = AddToWishlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, parsed.data.productId)));

  if (existing.length === 0) {
    await db.insert(wishlistTable).values({ userId, productId: parsed.data.productId });
  }

  res.json({ message: "Added to wishlist" });
});

router.delete("/wishlist/:productId", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = RemoveFromWishlistParams.safeParse({ productId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(wishlistTable)
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, params.data.productId)));

  res.json({ message: "Removed from wishlist" });
});

export default router;
