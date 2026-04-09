import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { AddToCartBody, RemoveFromCartParams } from "@workspace/api-zod";

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

async function buildCartResponse(userId: number) {
  const items = await db.select().from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const cartItems = items.map((row) => ({
    id: row.cart_items.id,
    productId: row.cart_items.productId,
    product: row.products ? formatProduct(row.products) : null,
    quantity: row.cart_items.quantity,
    price: parseFloat(row.cart_items.price),
  }));

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return { items: cartItems, total, itemCount };
}

router.get("/cart", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.json({ items: [], total: 0, itemCount: 0 });
    return;
  }

  const cart = await buildCartResponse(userId);
  res.json(cart);
});

router.post("/cart", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity = 1 } = parsed.data;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const existing = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));

  if (existing.length > 0) {
    await db.update(cartItemsTable)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({
      userId,
      productId,
      quantity,
      price: product.price,
    });
  }

  const cart = await buildCartResponse(userId);
  res.json(cart);
});

router.delete("/cart/:itemId", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const raw = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const params = RemoveFromCartParams.safeParse({ itemId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(cartItemsTable)
    .where(and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.userId, userId)));

  const cart = await buildCartResponse(userId);
  res.json(cart);
});

router.delete("/cart/clear", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  res.json({ message: "Cart cleared" });
});

export default router;
