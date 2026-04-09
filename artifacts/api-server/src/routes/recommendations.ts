import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, productsTable, preferencesTable } from "@workspace/db";
import { GetRecommendationsQueryParams } from "@workspace/api-zod";

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

router.get("/recommendations", async (req, res): Promise<void> => {
  const params = GetRecommendationsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { mood, userId } = params.data;

  let products;

  if (userId) {
    const [prefs] = await db.select().from(preferencesTable).where(eq(preferencesTable.userId, userId));
    if (prefs) {
      const effectiveMood = mood || prefs.currentMood;
      products = await db.select().from(productsTable)
        .where(eq(productsTable.mood, effectiveMood))
        .orderBy(sql`CAST(${productsTable.rating} AS numeric) DESC`)
        .limit(12);

      if (products.length < 6) {
        const more = await db.select().from(productsTable)
          .orderBy(sql`CAST(${productsTable.rating} AS numeric) DESC`)
          .limit(12);
        const existing = new Set(products.map((p) => p.id));
        products = [...products, ...more.filter((p) => !existing.has(p.id))].slice(0, 12);
      }
    }
  }

  if (!products) {
    const effectiveMood = mood || "chill";
    products = await db.select().from(productsTable)
      .where(eq(productsTable.mood, effectiveMood))
      .orderBy(sql`CAST(${productsTable.rating} AS numeric) DESC`)
      .limit(12);

    if (products.length < 6) {
      products = await db.select().from(productsTable)
        .orderBy(sql`CAST(${productsTable.rating} AS numeric) DESC`)
        .limit(12);
    }
  }

  res.json(products.map((p) => ({
    ...formatProduct(p),
    aiReason: p.aiReason || `Top pick for ${mood || "you"} — highly rated with excellent trust score`,
  })));
});

export default router;
