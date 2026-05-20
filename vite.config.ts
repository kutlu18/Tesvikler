import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/Tesvikler/" : "/",
  cacheDir: process.env.VITE_CACHE_DIR ?? (process.env.TEMP ? `${process.env.TEMP}/tesvikler-vite-cache` : "node_modules/.vite"),
  optimizeDeps: {
    entries: ["index.html"],
  },
});
