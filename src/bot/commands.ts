import yargs from "yargs";

/**
Token used to distinguish a command from a normal chat message (like the "/" for Minecraft commands)
*/
export const COMMAND_DELIMITER = "$";

/**
 * Declares bot commands, their arguments and descriptions
 */
const commands = yargs()
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
  });

/**
 * Parses an input string as a command
 * @param input Raw input string
 * @returns The parsed arguments to the command
 */
export function parseCommand(input: string) {
  return commands
    .exitProcess(false)
    .fail((_, err) => {
      throw err;
    })
    .parse(input.slice(COMMAND_DELIMITER.length).split(/\s+/));
}

/**
 * Gets the help menu for the configured bot commands
 * @returns Help message as a string
 */
export async function getHelpMsg(): Promise<string> {
  return commands.getHelp();
}
