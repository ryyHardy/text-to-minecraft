import { type Bot } from "mineflayer";
import { type TextMCBot } from "./bot/bot";

export interface TextMCAPI {
  testPreload: () => void;
  createPlayer: (host: string, port: number, username: string) => Promise<Bot>;
  createBot: (player: Bot, exclusiveUsers: string[] = []) => TextMCBot;
}

declare global {
  interface Window {
    textmc: TextMCAPI;
  }
}
