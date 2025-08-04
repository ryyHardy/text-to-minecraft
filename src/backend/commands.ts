import yargs from "yargs";
import { parseArgsStringToArgv } from "string-argv";

function getCommands() {
  /**
   * Declares bot commands, their arguments and descriptions
   */
  return yargs()
    .command("helpme", "Show help menu for commands")

    .command("exit", "Disconnect from the world")

    .command("where", "Get current location")

    .command("come", "Walk to the sender")

    .command("build <prompt>", "Build something based on a prompt", yargs => {
      return yargs.positional("prompt", {
        type: "string",
        describe: "Prompt describing the structure",
      });
    })

    .exitProcess(false)
    .strictCommands()
    .fail(msg => {
      throw new Error(msg);
    })
    .scriptName("<bot-username>:");
}

/**
 * Parses an input string as a command
 * @param input Raw input string
 * @returns The parsed arguments to the command
 */
export function parseCommand(input: string) {
  const args = parseArgsStringToArgv(input);
  return getCommands().parseSync(args);
}

/**
 * Get the help message of the command configuration as a string
 *
 * @returns Promise of the help message as a string
 */
export function getHelpMsg(): Promise<string> {
  console.log("TEST!"); // ! Never shows up in the console somehow
  return getCommands().getHelp();
}
