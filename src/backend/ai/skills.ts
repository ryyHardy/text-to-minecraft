import { Bot } from "mineflayer";

/**
 * Place a particular block at a position in the world relative to the player
 * @param player The bot to use to place the block
 * @param point The point in Minecraft's coordinate system to place the block at
 * @param block The type of block to place
 */
export function placeBlock(
  player: Bot,
  x: number,
  y: number,
  z: number,
  block: string
) {
  player.chat(`/setblock ~${x} ~${y} ~${z} ${block}`);
}
