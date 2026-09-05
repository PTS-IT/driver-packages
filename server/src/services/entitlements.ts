import { prisma } from "../db";

export const FREE_VOICE_ENTRIES_PER_MONTH = 3;

export async function canRecordVoiceEntry(userId: string, isPremium: boolean): Promise<boolean> {
  if (isPremium) return true;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await prisma.entry.count({
    where: { userId, source: "voice", createdAt: { gte: startOfMonth } },
  });
  return count < FREE_VOICE_ENTRIES_PER_MONTH;
}
