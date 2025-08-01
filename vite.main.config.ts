import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, ".vite/build"),
    sourcemap: true,
    rollupOptions: {
      external: ["mineflayer", "mineflayer-pathfinder", "yargs", "string-argv"],
      output: {
        format: "cjs",
      },
    },
  },
});
