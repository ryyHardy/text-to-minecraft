import { ipcMain } from "electron";
import { createPlayer, TextMCBot } from "./bot";

const botInstances = new Map<string, TextMCBot>();

function setup() {
  // connect-bot handler (add instance to map)
  ipcMain.handle(
    "connect-bot",
    async (
      event,
      host: string,
      port: number,
      username: string,
      exclusiveUsers: string[] = []
    ) => {
      try {
        const player = await createPlayer(host, port, username);
        const bot = new TextMCBot(player, exclusiveUsers);
        botInstances.set(username, bot);

        // Listen for bot disconnect and have the Main process send when that happens
        player.once("end", reason => {
          botInstances.delete(username);
          event.sender.send("bot-disconnected", username, reason);
        });

        return { success: true, username };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  );

  // disconnect-bot handler (delete instance from map)
  ipcMain.handle("disconnect-bot", async (_, username: string) => {
    const bot = botInstances.get(username);
    if (bot) {
      bot.disconnect();
      botInstances.delete(username);
      return { success: true };
    }
    return { success: false, error: "Bot not found" };
  });

  // get-bot-status handler (get info on instance from map)
  ipcMain.handle("get-bot-status", (_, username: string) => {
    if (botInstances.has(username)) {
      return {
        connected: true,
        //TODO: Add more status data here is desired
      };
    }
  });
}

ipcMain.on("setup", setup);
