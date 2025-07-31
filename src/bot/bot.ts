import { createBot, Bot } from "mineflayer";
import { pathfinder, Movements, goals } from "mineflayer-pathfinder";

import { parseCommand, getHelp } from "./commands";

const MESSAGE_COLOR = "light_purple";

/**
 * Create a mineflayer bot and connect it to a server
 * @param host The host of the server to connect to
 * @param port The port on that server
 * @param username The username to give to the bot's player
 * @param onDisconnect Optional callback for when the bot disconnects from the world
 * @returns Promise of the connected mineflayer bot
 */
export function createPlayer(
  host: string,
  port: number,
  username: string,
  onDisconnect?: (reason: string) => void
): Promise<Bot> {
  return new Promise((resolve, reject) => {
    const player = createBot({
      host: host,
      port: port,
      username: username,
      version: "1.20.4",
      hideErrors: false,
    });

    player.once("spawn", () => {
      player.removeAllListeners();
      resolve(player);
    });

    player.once("error", err => {
      reject(
        new Error(
          `Bot failed to connect to host '${host}' on port ${port}:\n${err}`
        )
      );
    });

    player.once("end", reason => {
      player.removeAllListeners();
      onDisconnect(reason);
    });
  });
}

// interface Command {
//   description: string;
//   handler: (sender: string, args: yargsParser.Arguments) => void;
// }

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
      `Hello! Send '${this.username}: help' in the chat for a list of commands.`
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
      if (sender === this.username || !msg.startsWith(`${this.username}:`))
        return;

      if (
        this.exclusiveUsers.length > 0 &&
        !this.exclusiveUsers.includes(sender)
      ) {
        this.message(sender, "You are not in my list of exclusive users.");
        return;
      }

      // 'username: command arg1 arg2' -> 'command arg1 arg2'
      const cmd = msg.slice(this.username.length + 1);
      let parsed;
      try {
        parsed = parseCommand(cmd);
      } catch {
        this.message(
          sender,
          `Error reading command '${cmd}'. Try '${this.username}: help' for a list of commands.`
        );
        return;
      }

      // Switch by the command name (argument 0)
      switch (parsed._[0].toString()) {
        case "help": {
          const helpMsg = await getHelp();
          for (const line of helpMsg.split("\n")) {
            this.message(sender, line);
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
          break;
        }
      }
    });
  }

  /**
   * Send a message to a specific target
   *
   * @param target A username or a [Minecraft target selector](https://minecraft.wiki/w/Target_selectors) specifying who receives the message
   * @param msg The message to send
   */
  message(recipient: string, msg: string) {
    const tellraw = `/tellraw ${recipient} {"text":"[BOT] <${this.username}> ${msg}","color":"${MESSAGE_COLOR}"}`;
    this.player.chat(tellraw);
  }

  disconnect() {
    this.player.end("disconnect() function");
  }
}
