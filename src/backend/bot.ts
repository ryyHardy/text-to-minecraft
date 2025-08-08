import { createBot, Bot } from "mineflayer";
import { pathfinder, Movements, goals } from "mineflayer-pathfinder";

import { parseCommand, getHelpMsg } from "./commands";

import { runTSCode } from "./ai/execute";
import { generateBuildCode } from "./ai/model";

const HELP_COLOR = "green";
const MESSAGE_COLOR = "light_purple";

/**
 * Create a mineflayer bot and connect it to a server
 * @param host The host of the server to connect to
 * @param port The port on that server
 * @param username The username to give to the bot's player
 * @returns Promise of the connected mineflayer bot
 */
export function createPlayer(
  host: string,
  port: number,
  username: string
): Promise<Bot> {
  return new Promise((resolve, reject) => {
    const player = createBot({
      host: host,
      port: port,
      username: username,
      hideErrors: false,
    });

    player.once("spawn", () => {
      resolve(player);
    });

    player.once("error", err => {
      reject(
        new Error(
          `Bot failed to connect to host '${host}' on port ${port}:\n${err}`
        )
      );
    });
  });
}

export class TextMCBot {
  private player: Bot;
  private exclusiveUsers: string[];
  private movements: Movements;

  /**
   * Take a mineflayer player and convert it to a TextMCBot, which encapsulates new features on top of mineflayer's capabilities
   *
   * @param player The mineflayer bot to convert to a TextMCBot
   * @param exclusiveUsers A list of usernames of players exclusively allowed to command the bot. If empty (default), anyone can command it
   */
  constructor(player: Bot, exclusiveUsers: string[] = []) {
    // I love dependency injection so much
    this.player = player;
    this.exclusiveUsers = exclusiveUsers;

    this.player.loadPlugin(pathfinder);
    this.movements = new Movements(this.player);

    this.message(
      "@a",
      `Hello! Send '${this.username}: helpme' in the chat for a list of commands.`
    );

    this.setupListeners();
  }

  get username() {
    return this.player.username;
  }

  /**
   * Configure mineflayer event listeners for the bot
   */
  private setupListeners() {
    // Fires when a chat message happens in the world
    this.player.on("chat", async (sender, msg) => {
      if (
        !sender ||
        sender === this.username ||
        !msg.startsWith(`${this.username}:`)
      )
        return;

      if (
        this.exclusiveUsers.length > 0 &&
        !this.exclusiveUsers.includes(sender)
      ) {
        this.message(sender, "You are not in my list of exclusive users.");
        return;
      }

      // 'username: command arg1 arg2' -> 'command arg1 arg2'
      const cmd = msg.slice(this.username.length + 1).trim();

      let parsed;
      try {
        parsed = parseCommand(cmd);
      } catch (e) {
        console.error("Command Parsing Error:", e);
        this.message(
          sender,
          `Error reading command '${cmd}'. Try '${this.username}: helpme' for a list of commands.`
        );
        return;
      }

      // Switch by the command name (argument 0)
      switch (parsed._.length > 0 ? String(parsed._[0]) : "") {
        case "helpme": {
          try {
            const helpMsg = await getHelpMsg();
            this.tellraw(sender, "BOT HELP MENU:", HELP_COLOR);
            for (const line of helpMsg.split("\n")) {
              this.tellraw(sender, line, HELP_COLOR);
            }
          } catch (e) {
            console.log("Help Menu Error:", e);
            this.message(sender, "Help message unavailable due to error");
          }
          break;
        }
        case "exit": {
          this.player.end("exit command");
          break;
        }
        case "where": {
          const pos = this.player.entity.position;
          this.message(
            sender,
            `I'm at X: ${Math.floor(pos.x)}, Y: ${Math.floor(
              pos.y
            )}, Z: ${Math.floor(pos.z)} in the ${this.player.game.dimension}.`
          );
          break;
        }
        case "come": {
          const target = this.player.players[sender]?.entity;
          if (target) {
            const pos = target.position;
            this.player.pathfinder.setMovements(this.movements);
            // TODO: Consider a try-catch here just in case
            this.player.pathfinder.setGoal(
              new goals.GoalNear(pos.x, pos.y, pos.z, 1)
            );
          }
          break;
        }
        case "build": {
          // build handler
          let prompt = "";
          if (parsed._.length > 1) {
            prompt = String(parsed._[1]);
          }
          const code = await generateBuildCode(prompt);
          // runTSCode(this.player, code);
          break;
        }
      }
    });
  }

  /**
   * Helpful wrapper for the Minecraft /tellraw command (for messaging entities)
   * @param recipient A ussername or a [Minecraft target selector](https://minecraft.wiki/w/Target_selectors) specifying who receives the message
   * @param text The text to send
   * @param color Color of the text
   */
  private tellraw(recipient: string, text: string, color: string) {
    const command = `/tellraw ${recipient} {"text":"${text}", "color": "${color}"}`;
    this.player.chat(command);
  }

  /**
   * Send a message to a specific target
   *
   * @param target A username or a [Minecraft target selector](https://minecraft.wiki/w/Target_selectors) specifying who receives the message
   * @param msg The message to send
   */
  message(recipient: string, msg: string) {
    this.tellraw(recipient, `[BOT] <${this.username}> ${msg}`, MESSAGE_COLOR);
  }

  disconnect() {
    this.message("@a", "Bye! Disconnecting...");
    this.player.end("disconnect() function");
  }
}
