import { Router } from "express";
import { prisma } from "../db";
import { env } from "../env";

export const webhooksRouter = Router();

const ENTITLED_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "TRANSFER",
]);
const UNENTITLED_EVENTS = new Set(["EXPIRATION"]);

// RevenueCat → Project settings → Integrations → Webhooks. Set the
// "Authorization header" value there to the same string as
// REVENUECAT_WEBHOOK_AUTH_HEADER below so this endpoint can verify calls
// really come from RevenueCat.
webhooksRouter.post("/revenuecat", async (req, res) => {
  if (env.revenueCatWebhookAuthHeader) {
    if (req.headers.authorization !== env.revenueCatWebhookAuthHeader) {
      res.status(401).json({ error: "Invalid webhook auth header." });
      return;
    }
  }

  const event = req.body?.event;
  const appUserId: string | undefined = event?.app_user_id;
  const type: string | undefined = event?.type;

  if (!appUserId || !type) {
    res.status(400).json({ error: "Malformed RevenueCat webhook payload." });
    return;
  }

  // We call Purchases.logIn(user.id) from the mobile app, so RevenueCat's
  // app_user_id is our own User.id.
  const user = await prisma.user.findUnique({ where: { id: appUserId } });
  if (!user) {
    // Unknown user (e.g. a sandbox test event) — acknowledge so RevenueCat
    // doesn't retry, but there's nothing to update.
    res.status(200).json({ ok: true, ignored: true });
    return;
  }

  if (ENTITLED_EVENTS.has(type)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isPremium: true, revenueCatAppUserId: appUserId },
    });
  } else if (UNENTITLED_EVENTS.has(type)) {
    await prisma.user.update({ where: { id: user.id }, data: { isPremium: false } });
  }

  res.status(200).json({ ok: true });
});
