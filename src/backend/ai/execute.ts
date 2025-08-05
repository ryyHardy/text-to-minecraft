import { Bot } from "mineflayer";
import { createContext, runInContext } from "vm";
import { transpileModule, ModuleKind } from "typescript";

import * as botAPI from "./skills";

export function runTSCode(player: Bot, code: string) {
  const jsCode = transpileModule(code, {
    compilerOptions: {
      module: ModuleKind.CommonJS,
      strict: true,
    },
  }).outputText;

  const context = createContext({
    player: player,
    botAPI: botAPI,
  });

  runInContext(jsCode, context, {
    displayErrors: true,
  });
}
