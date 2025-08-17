import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { getSecret } from "../config/secrets";

import { Project } from "ts-morph";

import path from "path";

import dotenv from "dotenv";
dotenv.config();

export async function validateLLMKey(key: string) {
  try {
    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1/models",
      {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      }
    );

    if (!resp.ok) {
      return false;
    }

    // TODO: Think about an extra check of the JSON itself if needed
    // const data = await resp.json();
    // console.log("Validation response received:", data);

    return true;
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
    model: "gemini-2.5-pro", // TODO: Find a way to not hardcode the model and make it configurable
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
