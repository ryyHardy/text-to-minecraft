import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    outDir: ".vite/build/preload",
    rollupOptions: {
      external: ["mineflayer", "mineflayer-pathfinder", "electron"],
      output: {
        format: "cjs",
      },
    },
  },
});
