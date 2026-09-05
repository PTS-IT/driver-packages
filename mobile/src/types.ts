export type Mood = "great" | "good" | "neutral" | "low" | "rough";

export interface JournalEntry {
  id: string;
  createdAt: string;
  source: "voice" | "text";
  rawText: string;
  transcript: string | null;
  summary: string | null;
  mood: Mood | null;
  actionItems: string[];
  processing: boolean;
}

export interface InsightsPoint {
  date: string;
  mood: Mood;
}

export interface InsightsSummary {
  streakDays: number;
  entriesThisWeek: number;
  moodTrend: InsightsPoint[];
  topThemes: string[];
}

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
