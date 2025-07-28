import { describe, expect, test } from "vitest";
import { parseCommand } from "../src/bot/commands";

describe("Command Parsing", () => {
  test("parses build command with prompt", () => {
    const result = parseCommand('build "a treehouse"');
    expect(result._[0]).toBe("build");
    expect(result.prompt).toBe("a treehouse");
  });

  test("fails gracefully on missing required args", () => {
    expect(() => parseCommand("build")).toThrow();
  });

  test("fails gracefully on unknown commands", async () => {
    expect(() => parseCommand("fly away")).toThrow();
  });
});
