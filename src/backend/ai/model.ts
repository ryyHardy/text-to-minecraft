import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getSecret } from "../config/secrets";

export async function validateLLMKey(key: string) {
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    // If API key is invalid, Google responds with an error field in the JSON
    if (data.error) {
      return false;
    }
    // Check if an array of models is actually given, just to be sure
    return Array.isArray(data.models);
  } catch (_) {
    return false;
  }
}

// Hardcoded interface string extracted from api.ts
const BOT_INTERFACE_STRING = `interface BotInterface {
  /**
   * Place a block at (x,y,z) relative to the bot
   *
   * @param x x-coordinate of the block relative to the bot
   * @param y y-coordinate of the block relative to the bot
   * @param z z-coordinate of the block relative to the bot
   * @param block The block (in [block-state format](https://minecraft.wiki/w/Argument_types#block_state)) to place (ex: *cobblestone*, *oak_stairs[facing=east,waterlogged=true]*)
   */
  placeBlock: (x: number, y: number, z: number, block: string) => void;
}`;

const SYSTEM_PROMPT = `
You are an expert AI Minecraft build assistant. You generate runnable JavaScript code to build structures in Minecraft
using ONLY the provided API (accessible through the \`botAPI\` global object). You must NOT explain anything, only output JavaScript code
without markdown, markdown delimiters, or code comments.

API available:
${BOT_INTERFACE_STRING.trim()}

Rules:
- Only call the functions listed in the API.
- Do not include imports, require calls, or code that depends on outside libraries.
- Code must be self-contained and executable inside the provided vm sandbox.
- Output only JavaScript code, no other text.
- Code should use JavaScript best practices such as loops and functions to avoid repetition.
`;

export async function generateBuildCode(
  prompt: string,
  version: string
): Promise<string> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash", // TODO: Find a way to not hardcode the model and make it configurable
    temperature: 0,
    maxRetries: 2,
    maxOutputTokens: 10000, // same with stuff too, I suppose
    apiKey: getSecret("gemini-api-key"), // maybe don't call getSecret here, as well
  });

  const fullPrompt = `
  ${SYSTEM_PROMPT}
  
  Use Minecraft version ${version}.

  User request:
  ${prompt}

  `;

  const response = await model.invoke(fullPrompt);
  const code = response.content as string;
  console.info(`Build Code Generated:\n${code}`);
  return code;
}
