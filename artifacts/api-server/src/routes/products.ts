import { Router, type IRouter } from "express";
import { eq, and, gte, lte, like, or, sql } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { ListProductsQueryParams, GetProductParams, GetRelatedProductsParams } from "@workspace/api-zod";

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

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { category, mood, minPrice, maxPrice, minRating, search } = params.data;

  let query = db.select().from(productsTable);
  const conditions: any[] = [];

  if (category) conditions.push(eq(productsTable.category, category));
  if (mood) conditions.push(eq(productsTable.mood, mood));
  if (minPrice != null) conditions.push(gte(sql`CAST(${productsTable.price} AS numeric)`, minPrice));
  if (maxPrice != null) conditions.push(lte(sql`CAST(${productsTable.price} AS numeric)`, maxPrice));
  if (minRating != null) conditions.push(gte(sql`CAST(${productsTable.rating} AS numeric)`, minRating));
  if (search) {
    conditions.push(or(
      like(productsTable.name, `%${search}%`),
      like(productsTable.description, `%${search}%`),
    ));
  }

  const products = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  res.json(products.map(formatProduct));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.get("/products/:id/related", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetRelatedProductsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const related = await db.select().from(productsTable)
    .where(and(eq(productsTable.category, product.category), sql`${productsTable.id} != ${product.id}`))
    .limit(4);

  res.json(related.map(formatProduct));
});

export default router;
