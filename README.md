# Daily — AI Voice Journal

A native iOS/Android app people pay a subscription for. Speak a 30-second
voice note about your day; AI transcribes it, summarizes it, reads your
mood, and pulls out any to-dos. Free tier is capped; **Daily Premium**
(subscription via the App Store / Play Store) unlocks unlimited AI voice
entries, mood trends & streaks, and unlimited history.

This repo has three parts:

| Path        | What it is                                                              |
| ----------- | ------------------------------------------------------------------------ |
| `mobile/`   | The product — Expo/React Native app (iOS + Android), TypeScript          |
| `server/`   | Backend API — auth, entries, AI pipeline, RevenueCat webhook             |
| `web-pwa/`  | An earlier free utility-tools PWA prototype, kept but no longer the product |

---

## How the pieces fit together

```
mobile app  --HTTPS-->  server/ API  --calls-->  OpenAI Whisper (transcription)
    |                        |                    Anthropic Claude (summary/mood/action items)
    |                        '--stores in-->  SQLite (dev) / Postgres (prod) via Prisma
    '--RevenueCat SDK-->  App Store / Play Store billing
                              |
                              '--webhook-->  server/ API (keeps isPremium in sync)
```

The mobile app never talks to Anthropic/OpenAI/RevenueCat's REST APIs
directly for anything sensitive — it talks to your own `server/`, which
holds the real API keys. RevenueCat's mobile SDK *is* used directly on
device (that's how App Store/Play billing works), but entitlement status
is also mirrored server-side via a webhook so free-tier limits can be
enforced safely.

---

## Run it locally

### 1. Backend

```bash
cd server
cp .env.example .env        # fill in JWT_SECRET at minimum
npm install
npx prisma migrate dev      # creates dev.db (SQLite)
npm run dev                 # http://localhost:4000
```

Without `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` set, the server still runs —
text entries get stored with a neutral placeholder analysis, and voice
uploads return a clear error — so you can build/test the rest of the app
before wiring up AI keys.

### 2. Mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone. Edit `mobile/app.json` →
`expo.extra.apiBaseUrl` to point at your machine's LAN IP (not
`localhost` — your phone can't reach your laptop's localhost), e.g.
`"http://192.168.1.23:4000"`.

**Note:** `react-native-purchases` (RevenueCat) needs custom native code
that Expo Go doesn't include. Until you build a dev client (see below),
the app still runs fine in Expo Go — `PurchasesProvider` detects the
missing native module and no-ops so the rest of the app keeps working;
you just won't see real subscription state.

---

## What's already built

- **Onboarding, auth (email/password), and a themed light/dark UI**
- **Record → transcribe → AI summary/mood/action-items** pipeline, wired end to end
- **Free-tier gating**: 3 free AI voice entries/month, then a paywall
- **RevenueCat scaffold**: `PurchasesContext`, a custom paywall screen reading
  live offerings/prices, purchase + restore flows
- **Insights screen** (streak, weekly count, 14-day mood trend, recurring
  themes) — gated behind Premium, computed server-side
- **Backend**: JWT auth, Prisma models, Whisper transcription, Claude-based
  analysis, RevenueCat webhook that flips `isPremium` on subscribe/expire

Both `mobile/` (`npx tsc --noEmit`) and `server/` typecheck clean, and the
mobile app bundles successfully for both iOS and Android (`npx expo export
--platform ios|android`). The backend was smoke-tested end-to-end locally:
signup → login → create entry → list → RevenueCat webhook flips
`isPremium` → insights unlock.

## What I could *not* do from this sandbox

Publishing to the app stores needs accounts and approvals only you can
grant — here's exactly what's left, in order:

### 1. Accounts you'll need
- **Apple Developer Program** — $99/year, at https://developer.apple.com/programs/
- **Google Play Console** — $25 one-time, at https://play.google.com/console/
- **RevenueCat** — free tier is enough to start, at https://app.revenuecat.com/
- **Anthropic API key** — https://console.anthropic.com/ (entry analysis)
- **OpenAI API key** — https://platform.openai.com/ (Whisper transcription only)

### 2. RevenueCat project setup
1. Create a project, then add an **iOS app** and an **Android app**, using
   the bundle ID / package name already set in `mobile/app.json`
   (`com.dailyjournal.app` — change this to something you own first, e.g.
   reverse-DNS of a domain you control).
2. Create an **Entitlement** called exactly `premium` (the code checks for
   this ID in `mobile/src/context/PurchasesContext.tsx`).
3. In App Store Connect / Play Console, create the actual subscription
   products (e.g. monthly + annual), then attach them to RevenueCat as
   **Products**, and group them into an **Offering** — this is what
   `PaywallScreen` renders automatically (title + live price), no app code
   changes needed when you change pricing.
4. Copy the **public** iOS and Android API keys into
   `mobile/app.json` → `expo.extra.revenueCatApiKeyIos` /
   `revenueCatApiKeyAndroid`.
5. Under Project settings → Integrations → Webhooks, add
   `https://<your-deployed-server>/api/webhooks/revenuecat`, set an
   Authorization header value, and put that same value in the server's
   `REVENUECAT_WEBHOOK_AUTH_HEADER`.

### 3. App Store Connect / Play Console
- Register the app with the same bundle ID/package name.
- Create the subscription products referenced above.
- Fill in the store listing, privacy policy URL (required — this app
  records audio and stores journal text), screenshots, and app review
  information microphone usage explanation is already in `app.json`.

### 4. Build and submit (EAS)
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios       # or android, or --platform all
eas submit --platform ios      # after the build finishes
```
This requires your Apple/Google credentials during `eas build`/`eas
submit` — EAS will prompt for them interactively.

### 5. Deploy the backend
`server/` is a plain Express app — deploy it anywhere that runs Node
(Fly.io, Render, Railway, a VPS). For production, swap the Prisma
datasource from SQLite to Postgres (`server/prisma/schema.prisma` →
`provider = "postgresql"`, update `DATABASE_URL`) since SQLite is a
single-file database that doesn't suit a multi-instance deployment. Set
all of `server/.env.example`'s variables as real environment variables on
whatever platform you choose, then point `mobile/app.json` →
`expo.extra.apiBaseUrl` at its public URL before your next EAS build.

### 6. Things that only a real device + live store sandbox can verify
- An actual purchase completing and `PurchasesContext.isPremium` flipping
- Microphone permission prompts and recording quality on physical hardware
- Push notification delivery (a daily journaling reminder is a natural
  next feature — `expo-notifications` is already installed but not yet
  wired to a scheduled local notification)
- App Store / Play Store review (content ratings, privacy nutrition
  label, subscription terms disclosure — Apple requires subscription
  terms to be shown before purchase, which `PaywallScreen` should be
  extended to include verbatim before submitting)

---

## Environment variables (`server/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Prisma datasource, `file:./dev.db` for local dev |
| `JWT_SECRET` | yes | Signs auth tokens — use a long random string |
| `ANTHROPIC_API_KEY` | for AI analysis | Summary, mood, action items |
| `OPENAI_API_KEY` | for voice entries | Whisper transcription only |
| `REVENUECAT_WEBHOOK_AUTH_HEADER` | for production | Verifies RevenueCat webhook calls |
| `PORT` | no | Defaults to 4000 |
