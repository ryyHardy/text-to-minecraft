import { expect, test } from "vitest";
import { getInterfaceAsString } from "../../src/backend/ai/api";

test("a string form of the interface can be obtained to give to AI as context", () => {
  const interfaceStr = getInterfaceAsString().trim();

  expect(
    interfaceStr.startsWith("interface") ||
      interfaceStr.startsWith("export interface"),
    "String contains an interface?"
  ).toBe(true);

  expect(interfaceStr.includes("/**"), "Includes TSDoc comments?").toBe(true);
});
