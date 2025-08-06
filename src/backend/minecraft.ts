import minecraftData from "minecraft-data";

export const MC_VERSION = "1.20.4";

const MC_DATA = minecraftData(MC_VERSION);

/**
 * @returns Array of all block names in Minecraft
 */
export function getAllBlocks(): string[] {
  const blocks = [];
  for (const blockId in MC_DATA.blocks) {
    blocks.push(MC_DATA.blocks[blockId].name);
  }
  return blocks;
}
