import { app } from "electron";
import { safeStorage } from "electron";
import * as fs from "fs";
import * as path from "path";

/**
 * Signature for a specific LLM model (ex: OpenAI ChatGPT-4o)
 */
type LLM = {
  provider: string;
  model: string;
};

/**
 * Gets an ID string for an LLM
 * @param llm The LLM object to ID
 * @returns String ID in the format 'provider:model'
 */
function llmId(llm: LLM): string {
  return `${llm.provider}:${llm.model}`;
}

const userDataPath = app.getPath("userData");
const llmPath = path.join(userDataPath, "llm-config.json");
const keysPath = path.join(userDataPath, "llm-keys.enc");

/**
 * Gets all LLMs configured by the user from llm-config.json
 * @returns Array of LLM objects
 */
export function getAllLLMs(): LLM[] {
  if (!fs.existsSync(llmPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(llmPath, "utf-8");
    return JSON.parse(content) as LLM[];
  } catch (error) {
    console.error("Failed to parse LLM config", error);
    return [];
  }
}

/**
 * Saves LLMs on the filesystem in llm-config.json
 * @param llms Array of LLMs to save
 */
function saveAllLLMs(llms: LLM[]) {
  fs.writeFileSync(llmPath, JSON.stringify(llms, null, 2), "utf-8");
}

/**
 * Read and decrypt all LLM keys from llm-keys.enc
 * @returns Record mapping LLMs to their API keys
 */
export function getLLMKeys(): Record<string, string> {
  if (!fs.existsSync(keysPath)) {
    return {};
  }

  try {
    const encrypted = fs.readFileSync(keysPath);
    const decrypted = safeStorage.decryptString(encrypted);
    return JSON.parse(decrypted) as Record<string, string>;
  } catch (error) {
    console.error("Failed to read LLM keys", error);
    return {};
  }
}

/**
 * Saves keys for LLMs by encrypting them on the filesystem in llm-keys.enc
 * @param keys Record mapping LLMs to their API keys
 */
function saveLLMKeys(keys: Record<string, string>) {
  const json = JSON.stringify(keys);
  const encrypted = safeStorage.encryptString(json);
  fs.writeFileSync(keysPath, encrypted);
}

/**
 * Add an LLM and its API key to the config, or update if LLM is present already
 * @param llm LLM to store
 * @param apiKey The API key used for this LLM
 */
export function addLLM(llm: LLM, apiKey: string) {
  const llms = getAllLLMs();
  if (!llms.find(m => llmId(m) === llmId(llm))) {
    // If LLM doesn't exist in config yet, add and save it
    llms.push(llm);
    saveAllLLMs(llms);
  }

  // Map the LLM to its key and save it
  const keys = getLLMKeys();
  keys[llmId(llm)] = apiKey;
  saveLLMKeys(keys);
}

/**
 * Remove an LLM from the config
 * @param llm The LLM object to remove
 */
export function removeLLM(llm: LLM) {
  const id = llmId(llm);

  // Remove from list
  saveAllLLMs(getAllLLMs().filter(m => llmId(m) !== id));

  // Remove from keys
  const keys = getLLMKeys();
  delete keys[id];
  saveLLMKeys(keys);
}

/**
 * Get the API key for an LLM from config
 * @param llm The LLM to look up the key for
 * @returns The key or undefined if not found
 */
export function getApiKey(llm: LLM): string | undefined {
  const keys = getLLMKeys();
  return keys[llmId(llm)];
}
