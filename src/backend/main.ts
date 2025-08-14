import { ipcMain } from "electron";
import { createPlayer, TextMCBot } from "./bot";

/** Manages the lifetime of all bot instances, indexed by username */
const botInstances = new Map<string, TextMCBot>();

/**
 * Initializes the backend by creating electron ipc handlers
 */
export function setup() {
  console.log("SETUP SETUP SETUP");

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
        // Listen for bot disconnect and have the Main process send when that happens
        player.once("end", reason => {
          player.removeAllListeners();
          botInstances.delete(username);
          event.sender.send("bot-disconnected", username, reason);
        });

        botInstances.set(username, new TextMCBot(player, exclusiveUsers));

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
        //TODO: Add more status data here if desired
      };
    } else {
      return {
        connected: false, // bot doesn't exist, basically
      };
    }
  });
}
