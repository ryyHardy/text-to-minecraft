import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Project } from "ts-morph";
import path from "path";

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

function getBotInterfaceString() {
  const project = new Project();
  const apiFileAbsolutePath = path.resolve(
    process.cwd(),
    "src/backend/ai/api.ts"
  );
  const apiMorph = project.addSourceFileAtPath(apiFileAbsolutePath);
  const face = apiMorph.getInterface("BotInterface");
  return face.getFullText();
}

const SYSTEM_PROMPT = `
You are an expert AI Minecraft build assistant. You generate runnable JavaScript code to build structures in Minecraft
using ONLY the provided API (accessible through the \`botAPI\` global object). You must NOT explain anything, only output JavaScript code
without markdown or comments.

API available:
${getBotInterfaceString().trim()}

Rules:
- Only call the functions listed in the API.
- Do not include imports, require calls, or code that depends on outside libraries.
- Code must be self-contained and executable inside the provided vm sandbox.
- Output only JavaScript code, no other text.
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
