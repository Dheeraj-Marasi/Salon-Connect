import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import {
  RegisterBody,
  LoginBody,
  UpdateProfileBody,
  LoginResponse as AuthUserResponse,
  LogoutResponse,
  GetMeResponse,
} from "@workspace/api-zod";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const router: IRouter = Router();

function toAuthUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    address: user.address ?? null,
    area: user.area ?? null,
    latitude: user.latitude ?? null,
    longitude: user.longitude ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, phone, address, area, latitude, longitude } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    phone: phone ?? null,
    address: address ?? null,
    area: area ?? null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  }).returning();

  req.session.userId = user.id;
  res.status(201).json(AuthUserResponse.parse(toAuthUser(user)));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(404).json({ error: "No account found with this email.", code: "EMAIL_NOT_FOUND" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Incorrect password. Please try again." });
    return;
  }

  req.session.userId = user.id;
  res.json(AuthUserResponse.parse(toAuthUser(user)));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json(LogoutResponse.parse({ message: "Logged out successfully." }));
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "User not found." });
    return;
  }
  res.json(GetMeResponse.parse(toAuthUser(user)));
});

router.patch("/auth/profile", async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.name != null) updates.name = parsed.data.name;
  if (parsed.data.phone != null) updates.phone = parsed.data.phone;
  if (parsed.data.address != null) updates.address = parsed.data.address;
  if (parsed.data.area != null) updates.area = parsed.data.area;
  if (parsed.data.latitude != null) updates.latitude = parsed.data.latitude;
  if (parsed.data.longitude != null) updates.longitude = parsed.data.longitude;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  res.json(AuthUserResponse.parse(toAuthUser(user)));
});

export default router;
