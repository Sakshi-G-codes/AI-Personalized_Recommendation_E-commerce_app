import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, cartItemsTable, productsTable } from "@workspace/db";
import { CreateOrderBody } from "@workspace/api-zod";

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

router.get("/orders", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.json([]);
    return;
  }

  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(ordersTable.createdAt);

  res.json(orders.map((o) => ({
    id: o.id,
    status: o.status,
    total: parseFloat(o.total),
    items: [],
    address: `${o.address}, ${o.city}, ${o.state} ${o.zipCode}, ${o.country}`,
    createdAt: o.createdAt.toISOString(),
  })));
});

router.post("/orders", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cartItems = await db.select().from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const total = cartItems.reduce((sum, row) => {
    return sum + parseFloat(row.cart_items.price) * row.cart_items.quantity;
  }, 0);

  const { address, city, state, zipCode, country } = parsed.data;

  const [order] = await db.insert(ordersTable).values({
    userId,
    total: total.toFixed(2),
    status: "confirmed",
    address,
    city,
    state,
    zipCode,
    country,
  }).returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  const formattedItems = cartItems.map((row) => ({
    id: row.cart_items.id,
    productId: row.cart_items.productId,
    product: row.products ? formatProduct(row.products) : null,
    quantity: row.cart_items.quantity,
    price: parseFloat(row.cart_items.price),
  }));

  res.status(201).json({
    id: order.id,
    status: order.status,
    total: parseFloat(order.total),
    items: formattedItems,
    address: `${address}, ${city}, ${state} ${zipCode}, ${country}`,
    createdAt: order.createdAt.toISOString(),
  });
});

export default router;
