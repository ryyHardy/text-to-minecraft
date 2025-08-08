import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        "dotenv",
        "@langchain/core",
        "@langchain/openai",
        "minecraft-data",
        "mineflayer",
        "mineflayer-pathfinder",
        "string-argv",
        "ts-morph",
        "yargs",
      ],
    },
    sourcemap: true,
  },
});
