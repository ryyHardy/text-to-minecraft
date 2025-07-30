import { ipcMain } from "electron";
import { createPlayer, TextMCBot } from "./bot";

const botInstances = new Map<string, TextMCBot>();

export function setup() {
  ipcMain.handle(
    "connect-bot",
    async (
      event,
      {
        host,
        port,
        username,
        exclusiveUsers = [],
      }: {
        host: string;
        port: number;
        username: string;
        exclusiveUsers: string[];
      }
    ) => {
      try {
        const player = await createPlayer(host, port, username);
        const bot = new TextMCBot(player, exclusiveUsers);
        botInstances.set(username, bot);

        // Listen for bot disconnect
        player.once("end", reason => {
          botInstances.delete(username);
          event.sender.send("bot-disconnected", { username, reason });
        });

        return { success: true, username };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  );

  ipcMain.handle("disconnect-bot", async (_, username: string) => {
    const bot = botInstances.get(username);
    if (bot) {
      bot.disconnect();
      botInstances.delete(username);
      return { success: true };
    }
    return { success: false, error: "Bot not found" };
  });

  ipcMain.handle("get-bot-status", (_, username: string) => {
    return {
      connected: botInstances.has(username),
      // TODO: Add more status data here if desired
    };
  });
}
