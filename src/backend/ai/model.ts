import { ChatOpenAI } from "@langchain/openai";

import { Project } from "ts-morph";

import path from "path";

import dotenv from "dotenv";
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error("API key not found!");
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

const model = new ChatOpenAI({
  model: "chatgpt-4o-latest",
  temperature: 0,
  maxTokens: 10000,
  timeout: 60 * 1000, // 60 second timeout
  maxRetries: 2,
  apiKey: process.env.OPENAI_API_KEY,
});

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
