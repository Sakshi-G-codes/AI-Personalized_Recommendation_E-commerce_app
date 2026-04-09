import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { db, usersTable, preferencesTable } from "@workspace/db";
import {
  RegisterUserBody,
  LoginUserBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "trustcart_salt").digest("hex");
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    email,
    name,
    passwordHash: hashPassword(password),
  }).returning();

  await db.insert(preferencesTable).values({
    userId: user.id,
    favoriteColors: [],
    favoriteCategories: [],
    currentMood: "chill",
    privacyMode: "personalized",
  });

  const token = createHash("sha256").update(`${user.id}:${Date.now()}`).digest("hex");

  (req as any).session = (req as any).session || {};
  res.cookie("userId", user.id, { httpOnly: true, sameSite: "lax" });

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = createHash("sha256").update(`${user.id}:${Date.now()}`).digest("hex");
  res.cookie("userId", user.id, { httpOnly: true, sameSite: "lax" });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  res.clearCookie("userId");
  res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = parseInt(String(req.cookies?.userId ?? ""));
  if (!userId || isNaN(userId)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
