import express from "express";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import "./models/index.js";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "tesvikler-server", env: env.nodeEnv, at: new Date().toISOString() });
});

app.get("/meta/modules", (_req, res) => {
  res.json([
    "SGK",
    "KOSGEB",
    "TUBITAK",
    "YATIRIM",
    "TICARET",
  ]);
});

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error("Boot failure", error);
  process.exit(1);
});
