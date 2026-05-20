import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4200),
  mongoUri: process.env.MONGO_URI as string,
  mongoDbName: process.env.MONGO_DB_NAME || undefined,
};
