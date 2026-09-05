export type Mood = "great" | "good" | "neutral" | "low" | "rough";

export interface EntryDTO {
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
