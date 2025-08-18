import { ipcMain } from "electron";
import { validateLLMKey } from "./ai/model";
import { createPlayer, TextMCBot } from "./bot";
import { getSecret, setSecret } from "./config/secrets";

/** Manages the lifetime of all bot instances, indexed by username */
const botInstances = new Map<string, TextMCBot>();

/**
 * Initializes the backend and creates electron IPC handlers
 */
export default function init() {
  initConfigIPC();
  initAiIPC();
  initBotIPC();
}

/**
 * Creates IPC handlers for the config API
 */
function initConfigIPC() {
  ipcMain.handle("set-secret", (_, name: string, value: string) => {
    setSecret(name, value);
  });

  ipcMain.handle("secret-exists", (_, name: string) => {
    return getSecret(name) !== undefined;
  });
}

/**
 * Creates IPC handlers for the AI features
 */
function initAiIPC() {
  ipcMain.handle("validate-llm-key", (_, key: string) => {
    return validateLLMKey(key);
  });
}

/**
 * Creates IPC handlers for the bot API
 */
function initBotIPC() {
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
