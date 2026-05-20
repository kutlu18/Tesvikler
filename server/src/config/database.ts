import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName,
    maxPoolSize: 20,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
