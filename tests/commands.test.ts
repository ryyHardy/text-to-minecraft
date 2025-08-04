import { describe, expect, test } from "vitest";
import { parseCommand, getHelpMsg } from "../src/backend/commands";

describe("Command Parsing", () => {
  test("parses commands with no args", () => {
    const commands = ["where", "come"];
    for (let cmd of commands) {
      const result = parseCommand(cmd);
      expect(result._[0]).toBe(cmd);
    }
  });

  test("parses build command with prompt", () => {
    const result = parseCommand('build "a treehouse"');
    expect(result._[0]).toBe("build");
    expect(result.prompt).toBe("a treehouse");
  });

  test("fails gracefully on missing required args", () => {
    expect(() => parseCommand("build")).toThrow();
  });

  test("fails gracefully on unknown commands", () => {
    expect(() => parseCommand("fly away")).toThrow();
  });

  test("help works", async () => {
    const msg = await getHelpMsg();
    console.log(msg);
    expect(msg).exist;
  });
});
