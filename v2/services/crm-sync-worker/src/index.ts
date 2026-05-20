import { runWorker } from "./infrastructure/runner";

runWorker()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("[crm-sync-worker] sync completed");
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("[crm-sync-worker] failed", error);
    process.exitCode = 1;
  });
