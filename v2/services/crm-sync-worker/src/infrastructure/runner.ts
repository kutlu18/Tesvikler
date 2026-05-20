import { config as loadDotEnv } from "dotenv";
import { getRuntimeEnv } from "@v2/config";
import { connectMongo, disconnectMongo } from "@v2/db-core";
import { SyncJob } from "../application/SyncJob";

loadDotEnv({ path: ".env.local" });

export async function runWorker(): Promise<void> {
  const env = getRuntimeEnv();
  await connectMongo(env.mongoUri);

  const job = new SyncJob();
  await job.pullFromCrm();

  await disconnectMongo();
}
