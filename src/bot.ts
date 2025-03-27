import mineflayer from "mineflayer";
import pathfinder from "mineflayer-pathfinder";

class TextMCBot {
  private player!: mineflayer.Bot; // Guaranteed to be set in create()

  private constructor(
    private username: string,
    private allowedUsers: string[]
  ) {}

  /**
   * Creates a TextMCBot and connects it to a server
   * @param host The host address to join
   * @param port The port on the server
   * @param username The username of the bot
   * @param allowedUsers Array of usernames for players allowed to command the bot
   * @returns
   */
  static async create(
    username: string,
    allowedUsers: string[],
    host: string,
    port: number
  ): Promise<TextMCBot> {
    const bot = new TextMCBot(username, allowedUsers);
    await bot.connect(host, port); // Try to connect the bot before continuing
    return bot;
  }

  private connect(host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.player = mineflayer.createBot({
        host: host,
        port: port,
        username: this.username,
        hideErrors: true,
      });

      this.player.loadPlugin(pathfinder.pathfinder);

      this.player.once("spawn", () => {
        resolve();
      });

      this.player.once("error", err => {
        reject(
          new Error(
            `Bot failed to connect to host '${host}' on port ${port}:\n${err}`
          )
        );
      });

      // this.player.once("end", () => {
      //   console.log("Bot disconnected");
      // });
    });
  }

  sendMessage(msg: string) {
    this.player.chat(msg);
  }
}

TextMCBot.create("TextMCBot", [], "localhost", 55555)
  .then(bot => {
    console.log("\nBot connected!\n");
    bot.sendMessage("Hello!");
  })
  .catch(err => console.error(err));
