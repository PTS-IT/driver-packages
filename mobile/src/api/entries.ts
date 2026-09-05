import { api } from "./client";
import { InsightsSummary, JournalEntry } from "../types";

export async function listEntries(): Promise<JournalEntry[]> {
  const { data } = await api.get<JournalEntry[]>("/api/entries");
  return data;
}

export async function getEntry(id: string): Promise<JournalEntry> {
  const { data } = await api.get<JournalEntry>(`/api/entries/${id}`);
  return data;
}

export async function createTextEntry(text: string): Promise<JournalEntry> {
  const { data } = await api.post<JournalEntry>("/api/entries/text", { text });
  return data;
}

export async function createAudioEntry(fileUri: string): Promise<JournalEntry> {
  const form = new FormData();
  form.append("audio", {
    uri: fileUri,
    name: "entry.m4a",
    type: "audio/m4a",
  } as unknown as Blob);

  const { data } = await api.post<JournalEntry>("/api/entries/audio", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteEntry(id: string): Promise<void> {
  await api.delete(`/api/entries/${id}`);
}

export async function getInsights(): Promise<InsightsSummary> {
  const { data } = await api.get<InsightsSummary>("/api/insights");
  return data;
}
