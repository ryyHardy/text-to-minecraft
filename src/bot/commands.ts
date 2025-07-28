import yargs from "yargs";
import stringArgv from "string-argv";

export function getCommands() {
  return yargs()
    .command(
      "help",
      "Show help menu for commands",
      () => {} // no args
    )

    .command(
      "exit",
      "Disconnect from the world",
      () => {} // no args
    )

    .command(
      "where",
      "Get current location",
      () => {} // no args
    )

    .command("come", "Walk to the sender", () => {})

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
  /**
   * Declares bot commands, their arguments and descriptions
   */
  return getCommands().parseSync(stringArgv(input));
}

export async function getHelp(): Promise<string> {
  return getCommands().getHelp();
}
