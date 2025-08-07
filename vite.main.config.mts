import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      external: [
        "mineflayer",
        "mineflayer-pathfinder",
        "yargs",
        "string-argv",
        "ts-morph",
        "dotenv",
      ],
    },
    sourcemap: true,
  },
});
