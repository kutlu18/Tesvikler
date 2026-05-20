import { config as loadDotEnv } from "dotenv";

loadDotEnv({ path: ".env.local" });

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  apiPort: parsePort(process.env.API_PORT, 4010),
};
