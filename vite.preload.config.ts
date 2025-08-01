import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, ".vite/build/preload"),
    sourcemap: true,
    rollupOptions: {
      output: {
        format: "cjs",
      },
    },
  },
});
