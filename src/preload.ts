// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge } from "electron";
import { type Bot } from "mineflayer";
import { createPlayer, TextMCBot } from "./bot/bot";

contextBridge.exposeInMainWorld("textmc", {
  testPreload: () => console.log("PRELOAD!"),
  createPlayer: createPlayer,
  createBot: (player: Bot, exclusiveUsers: string[] = []) =>
    new TextMCBot(player, exclusiveUsers),
});
