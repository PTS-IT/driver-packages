import fs from "fs";
import os from "os";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { analyzeEntry, transcribeAudio } from "../services/ai";
import { canRecordVoiceEntry } from "../services/entitlements";
import { serializeEntry } from "../services/serialize";

export const entriesRouter = Router();
entriesRouter.use(requireAuth);

const upload = multer({ dest: path.join(os.tmpdir(), "daily-journal-uploads") });

entriesRouter.get("/", async (req: AuthedRequest, res) => {
  const entries = await prisma.entry.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(entries.map(serializeEntry));
});

entriesRouter.get("/:id", async (req: AuthedRequest, res) => {
  const entry = await prisma.entry.findFirst({ where: { id: String(req.params.id), userId: req.userId } });
  if (!entry) {
    res.status(404).json({ error: "Entry not found." });
    return;
  }
  res.json(serializeEntry(entry));
});

entriesRouter.post("/text", async (req: AuthedRequest, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "text is required." });
    return;
  }

  const analysis = await analyzeEntry(text);
  const entry = await prisma.entry.create({
    data: {
      userId: req.userId!,
      source: "text",
      rawText: text,
      transcript: null,
      summary: analysis.summary,
      mood: analysis.mood,
      actionItems: JSON.stringify(analysis.actionItems),
    },
  });

  res.status(201).json(serializeEntry(entry));
});

entriesRouter.post("/audio", upload.single("audio"), async (req: AuthedRequest, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "audio file is required." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const allowed = await canRecordVoiceEntry(req.userId!, Boolean(user?.isPremium));
    if (!allowed) {
      res.status(402).json({ error: "UPGRADE_REQUIRED", message: "Free voice entry limit reached for this month." });
      return;
    }

    const transcript = await transcribeAudio(file.path);
    const analysis = await analyzeEntry(transcript);

    const entry = await prisma.entry.create({
      data: {
        userId: req.userId!,
        source: "voice",
        rawText: transcript,
        transcript,
        summary: analysis.summary,
        mood: analysis.mood,
        actionItems: JSON.stringify(analysis.actionItems),
      },
    });

    res.status(201).json(serializeEntry(entry));
  } finally {
    fs.unlink(file.path, () => undefined);
  }
});

entriesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const entry = await prisma.entry.findFirst({ where: { id: String(req.params.id), userId: req.userId } });
  if (!entry) {
    res.status(404).json({ error: "Entry not found." });
    return;
  }
  await prisma.entry.delete({ where: { id: entry.id } });
  res.status(204).end();
});
