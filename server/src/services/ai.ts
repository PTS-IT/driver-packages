import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { env } from "../env";
import { Mood } from "../types";

const anthropic = env.anthropicApiKey ? new Anthropic({ apiKey: env.anthropicApiKey }) : null;
const openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

export async function transcribeAudio(filePath: string): Promise<string> {
  if (!openai) {
    throw new Error(
      "OPENAI_API_KEY isn't set — voice transcription requires it (used for Whisper only)."
    );
  }
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
  });
  return transcription.text;
}

export interface EntryAnalysis {
  summary: string;
  mood: Mood;
  actionItems: string[];
}

const VALID_MOODS: Mood[] = ["great", "good", "neutral", "low", "rough"];

const ANALYSIS_SYSTEM_PROMPT = `You are the analysis engine behind a personal daily journal app.
Given a journal entry, respond with ONLY a single JSON object (no prose, no markdown fences) shaped exactly like:
{"summary": string, "mood": "great"|"good"|"neutral"|"low"|"rough", "actionItems": string[]}

Rules:
- "summary" is 1-2 short sentences, second person ("You..."), warm but not saccharine.
- "mood" is your best-effort read of the writer's emotional state that day.
- "actionItems" are concrete to-dos the writer mentioned wanting to do (empty array if none). Keep each under 12 words.`;

export async function analyzeEntry(text: string): Promise<EntryAnalysis> {
  if (!anthropic) {
    // No API key configured in this environment — return a neutral
    // placeholder so the rest of the app keeps working during local dev.
    return { summary: text.slice(0, 140), mood: "neutral", actionItems: [] };
  }

  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 1024,
    output_config: { effort: "medium" },
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

  return parseAnalysis(raw, text);
}

function parseAnalysis(raw: string, fallbackText: string): EntryAnalysis {
  try {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    const mood: Mood = VALID_MOODS.includes(parsed.mood) ? parsed.mood : "neutral";
    const actionItems = Array.isArray(parsed.actionItems)
      ? parsed.actionItems.filter((item: unknown) => typeof item === "string")
      : [];
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : fallbackText.slice(0, 140),
      mood,
      actionItems,
    };
  } catch {
    return { summary: fallbackText.slice(0, 140), mood: "neutral", actionItems: [] };
  }
}
