import { Bot } from "mineflayer";

interface BotInterface {
  /**
   * Place a block at (x,y,z) relative to the bot
   *
   * @param x x-coordinate of the block relative to the bot
   * @param y y-coordinate of the block relative to the bot
   * @param z z-coordinate of the block relative to the bot
   * @param block The block (in [block-state format](https://minecraft.wiki/w/Argument_types#block_state)) to place (ex: *cobblestone*, *oak_stairs[facing=east,waterlogged=true]*)
   */
  placeBlock: (x: number, y: number, z: number, block: string) => void;
}

export class BotAPI implements BotInterface {
  private bot: Bot;
  constructor(bot: Bot) {
    this.bot = bot;
  }

  placeBlock(x: number, y: number, z: number, block: string) {
    this.bot.chat(`/setblock ~${x} ~${y} ~${z} ${block}`);
  }
}
