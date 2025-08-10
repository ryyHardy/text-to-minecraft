import { createContext, runInContext } from "vm";
import { Bot } from "mineflayer";

import { BotAPI } from "./api";

export function runJSCode(bot: Bot, code: string) {
  const context = createContext({
    botAPI: new BotAPI(bot),
  });

  runInContext(code, context, {
    displayErrors: true,
  });
}
