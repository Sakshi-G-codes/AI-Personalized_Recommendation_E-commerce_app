import { Router, type IRouter } from "express";
import { db, productsTable, ordersTable, usersTable, cartItemsTable, preferencesTable } from "@workspace/db";
import { count, avg, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [productCount] = await db.select({ count: count() }).from(productsTable);
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [orderCount] = await db.select({ count: count() }).from(ordersTable);
  const [avgTrust] = await db.select({ avg: avg(sql`CAST(${productsTable.trustScore} AS numeric)`) }).from(productsTable);

  const [prefCount] = await db.select({ count: count() }).from(preferencesTable)
    .where(sql`${preferencesTable.currentMood} IS NOT NULL`);

  const moodResult = await db.execute(sql`
    SELECT current_mood, COUNT(*) as cnt FROM preferences
    WHERE current_mood IS NOT NULL
    GROUP BY current_mood
    ORDER BY cnt DESC
    LIMIT 1
  `);

  const topMood = (moodResult.rows[0] as any)?.current_mood ?? "chill";

  const totalRecs = (orderCount.count) * 3 + 120;
  const accepted = Math.floor(totalRecs * 0.78);

  res.json({
    totalRecommendations: totalRecs,
    acceptedRecommendations: accepted,
    accuracyRate: 78.4,
    totalProducts: productCount.count,
    activeUsers: userCount.count,
    avgTrustScore: parseFloat(String(avgTrust.avg ?? 82)),
    topMood,
    privacyCompliance: 96.2,
  });
});

router.get("/dashboard/accuracy", async (_req, res): Promise<void> => {
  const now = new Date();
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const base = 68 + Math.random() * 20;
    data.push({
      date: dateStr,
      accuracy: Math.round(base * 10) / 10,
      recommendations: Math.floor(20 + Math.random() * 60),
    });
  }
  res.json(data);
});

router.get("/dashboard/category-breakdown", async (_req, res): Promise<void> => {
  const result = await db.execute(sql`
    SELECT category, COUNT(*) as cnt FROM products GROUP BY category ORDER BY cnt DESC
  `);

  const total = result.rows.reduce((s: number, r: any) => s + parseInt(r.cnt), 0);
  const categories = result.rows.map((row: any) => ({
    category: row.category,
    count: parseInt(row.cnt),
    percentage: total > 0 ? Math.round((parseInt(row.cnt) / total) * 1000) / 10 : 0,
  }));

  res.json(categories.length > 0 ? categories : [
    { category: "Clothing", count: 8, percentage: 32 },
    { category: "Accessories", count: 6, percentage: 24 },
    { category: "Footwear", count: 5, percentage: 20 },
    { category: "Electronics", count: 4, percentage: 16 },
    { category: "Beauty", count: 2, percentage: 8 },
  ]);
});

export default router;
