import { Entry } from "@prisma/client";
import { EntryDTO, Mood } from "../types";

export function serializeEntry(entry: Entry): EntryDTO {
  return {
    id: entry.id,
    createdAt: entry.createdAt.toISOString(),
    source: entry.source as "voice" | "text",
    rawText: entry.rawText,
    transcript: entry.transcript,
    summary: entry.summary,
    mood: (entry.mood as Mood | null) ?? null,
    actionItems: JSON.parse(entry.actionItems || "[]"),
    processing: entry.processing,
  };
}
