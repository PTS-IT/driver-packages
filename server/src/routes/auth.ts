import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { env } from "../env";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const authRouter = Router();

function issueToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: "90d" });
}

function serializeUser(user: { id: string; email: string; isPremium: boolean; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    isPremium: user.isPremium,
    createdAt: user.createdAt.toISOString(),
  };
}

authRouter.post("/signup", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Email and a password of at least 6 characters are required." });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash },
  });

  res.status(201).json({ token: issueToken(user.id), user: serializeUser(user) });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  res.json({ token: issueToken(user.id), user: serializeUser(user) });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  res.json(serializeUser(user));
});
