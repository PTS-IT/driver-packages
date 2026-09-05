import express from "express";
import cors from "cors";
import { env } from "./env";
import { authRouter } from "./routes/auth";
import { entriesRouter } from "./routes/entries";
import { insightsRouter } from "./routes/insights";
import { webhooksRouter } from "./routes/webhooks";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/webhooks", webhooksRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(env.port, () => {
  console.log(`Daily journal API listening on :${env.port}`);
});
