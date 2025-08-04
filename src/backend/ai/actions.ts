import { Bot } from "mineflayer";

type Point = {
  x: number;
  y: number;
  z: number;
};

/**
 * Place a particular block at a position in the world
 * @param player The bot to use to place the block
 * @param point The point in Minecraft's coordinate system to place the block at
 * @param block The type of block to place
 */
export function placeBlock(player: Bot, point: Point, block: string) {
  player.chat(`/setblock ${point.x} ${point.y} ${point.z} ${block}`);
}

/**
 * Fill a rectangular region with a particular block type
 * - **NOTE:** The normal limit for a single fill action is adjustable in-game
 * via the *commandModificationBlockLimit* gamerule, and it defaults to a volumne of 32,768 blocks. This is for
 * a reason as large fill commands can lag the game significantly.
 * @param player The bot to use to fill the region
 * @param p1 First corner of the region
 * @param p2 Corner of the region diagonally opposite to *p1*
 * @param block The type of block to fill the region with
 */
export function fillBlock(player: Bot, p1: Point, p2: Point, block: string) {
  player.chat(`/fill ${p1.x} ${p1.y} ${p1.z} ${p2.x} ${p2.y} ${p2.z} ${block}`);
}
