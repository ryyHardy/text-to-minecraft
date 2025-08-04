import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["mineflayer", "mineflayer-pathfinder", "yargs", "string-argv"],
    },
    sourcemap: true,
  },
});
