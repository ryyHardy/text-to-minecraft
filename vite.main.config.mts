import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        "dotenv",
        "@langchain/core",
        "@langchain/google-genai",
        "langchain",
        "minecraft-data",
        "mineflayer",
        "mineflayer-pathfinder",
        "string-argv",
        "yargs",
      ],
    },
    sourcemap: true,
  },
});
