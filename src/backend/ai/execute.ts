import { createContext, runInContext } from "vm";
import { transpileModule, ModuleKind } from "typescript";
import { Bot } from "mineflayer";

import { BotAPI } from "./api";

export function runTSCode(bot: Bot, code: string) {
  const jsCode = transpileModule(code, {
    compilerOptions: {
      module: ModuleKind.CommonJS,
      strict: true,
    },
  }).outputText;

  const context = createContext({
    botAPI: new BotAPI(bot),
  });

  runInContext(jsCode, context, {
    displayErrors: true,
  });
}
