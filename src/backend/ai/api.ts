import { Bot } from "mineflayer";

import { Project } from "ts-morph";

const project = new Project();
const thisFileMorph = project.addSourceFileAtPath(__filename);

/*
In TypeScript, you can't get the string form of an interface
like you can with a function (they are compile-time-only objects)
so I engaged in the tomfoolery of using an AST library to
get it as a string instead
*/

export function getInterfaceAsString() {
  const face = thisFileMorph.getInterface("BotInterface");
  return face.getFullText();
}

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
