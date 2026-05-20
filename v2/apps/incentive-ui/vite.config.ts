import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.INCENTIVE_UI_PORT || 5175);

  return {
    plugins: [react()],
    server: {
      host: true,
      port,
      strictPort: true,
    },
  };
});
