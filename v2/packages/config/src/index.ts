export interface RuntimeEnv {
  mongoUri: string;
  mongoDbName: string;
  syncIntervalSeconds: number;
}

export function getRuntimeEnv(source: NodeJS.ProcessEnv = process.env): RuntimeEnv {
  return {
    mongoUri: source.MONGODB_URI || "mongodb://localhost:27017/tesvikler_v2",
    mongoDbName: source.MONGODB_DB_NAME || "tesvikler_v2",
    syncIntervalSeconds: Number(source.SYNC_INTERVAL_SECONDS || 60),
  };
}
