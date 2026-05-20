import express from "express";
import { env } from "./bootstrap/env";
import { healthRouter } from "./modules/health/health.routes";

const app = express();
app.use(express.json());
app.use(healthRouter);

app.get("/api/v1/status", (_req, res) => {
  res.json({
    app: "tesvikler-v2-api",
    status: "ready",
    mode: env.nodeEnv,
  });
});

app.listen(env.apiPort, () => {
  // eslint-disable-next-line no-console
  console.log(`[api-gateway] listening on ${env.apiPort}`);
});
