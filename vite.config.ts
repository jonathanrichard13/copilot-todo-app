import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: "node14",
    lib: {
      entry: "src/app.ts",
      formats: ["cjs"],
      fileName: "app"
    },
    rollupOptions: {
      external: [
        "express",
        "cors",
        "helmet",
        "morgan",
        "sqlite3",
        "uuid",
        "joi",
        "winston",
        "path",
        "fs",
        "util"
      ]
    },
    outDir: "dist"
  },
  server: {
    port: 3000
  }
});
