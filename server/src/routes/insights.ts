import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const insightsRouter = Router();
insightsRouter.use(requireAuth);

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "been", "it", "this", "that", "i", "you",
  "your", "my", "me", "at", "as", "so", "not", "no", "have", "has", "had",
  "today", "day", "felt", "feel", "feeling", "went", "get", "got", "will",
]);

insightsRouter.get("/", async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user?.isPremium) {
    res.status(403).json({ error: "Insights are a Daily Premium feature." });
    return;
  }

  const entries = await prisma.entry.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });

  const streakDays = computeStreak(entries.map((e) => e.createdAt));

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const entriesThisWeek = entries.filter((e) => e.createdAt >= weekAgo).length;

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const byDay = new Map<string, string>();
  for (const entry of entries) {
    if (entry.createdAt < fourteenDaysAgo || !entry.mood) continue;
    const key = entry.createdAt.toISOString().slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, entry.mood);
  }
  const moodTrend = Array.from(byDay.entries())
    .map(([date, mood]) => ({ date, mood }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const wordCounts = new Map<string, number>();
  for (const entry of entries) {
    const words = (entry.summary ?? "").toLowerCase().match(/[a-z']+/g) ?? [];
    for (const word of words) {
      if (word.length < 4 || STOPWORDS.has(word)) continue;
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
    }
  }
  const topThemes = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);

  res.json({ streakDays, entriesThisWeek, moodTrend, topThemes });
});

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const days = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
