import type { Bot } from "mineflayer";
import { logger } from "./logging";

export function attachBotObserver(player: Bot) {
  const username = player.username;

  logger.info({
    category: "connection",
    bot: username,
    message: "Bot instance created",
  });

  player.once("spawn", () => {
    logger.info({
      category: "connection",
      bot: username,
      message: "Spawned in world",
      data: { dimension: player.game?.dimension },
    });
  });

  player.once("end", (reason: any) => {
    logger.info({
      category: "connection",
      bot: username,
      message: "Disconnected",
      data: { reason },
    });
  });

  player.once("kicked", (reason: any) => {
    logger.warn({
      category: "connection",
      bot: username,
      message: "Kicked",
      data: { reason },
    });
  });

  player.on("error", (err: any) => {
    logger.error({
      category: "system",
      bot: username,
      message: "Bot error",
      data: { error: String(err) },
    });
  });
}
