import { MC_VERSION } from "../minecraft";

import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";

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

const client = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
  maxTokens: 10000,
  timeout: 60 * 1000, // 60 second timeout
  maxRetries: 2,
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are an AI Minecraft build assistant. You generate runnable JavaScript code to build structures in Minecraft version ${MC_VERSION}
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

export async function generateBuildCode(prompt: string) {
  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    code: "JavaScript code to execute in the Minecraft sandbox",
  });

  const fullPrompt = `
  ${SYSTEM_PROMPT}

  User request:
  ${prompt}

  ${parser.getFormatInstructions()}
  `;

  const response = await client.invoke(fullPrompt);
  const parsed = await parser.parse(response.text);
  console.info(`Code Generated:\n${parsed.code}`);
  return parsed.code;
}
