import { app, safeStorage } from "electron";
import * as fs from "fs";
import * as path from "path";

const USER_DATA_PATH = app.getPath("userData");
const KEYS_PATH = path.join(USER_DATA_PATH, "keys.enc");

function getAllKeys(): Record<string, string> {
  if (!fs.existsSync(KEYS_PATH)) {
    return {};
  }

  try {
    const encrypted = fs.readFileSync(KEYS_PATH);
    const decrypted = safeStorage.decryptString(encrypted);

    return JSON.parse(decrypted) as Record<string, string>;
  } catch (error) {
    console.error("Error reading API keys from api-keys.enc", error);
    return {};
  }
}

/**
 * Saves a record of API keys to config file
 * @param keys Record mapping names to API keys
 */
function saveKeys(keys: Record<string, string>) {
  const json = JSON.stringify(keys);
  const encrypted = safeStorage.encryptString(json);
  fs.writeFileSync(KEYS_PATH, encrypted);
}

/**
 * Sets a [name,key] pair and writes it to config file (encrypted, of course)
 * @param name Name of the API key
 * @param key The API key itself
 */
export function setKey(name: string, key: string) {
  const keys = getAllKeys();
  keys[name] = key;
  saveKeys(keys);
}

/**
 * Remove the API key associated with a given name from the config file
 * @param name The name of the API key to remove
 */
export function removeKey(name: string) {
  const keys = getAllKeys();
  delete keys[name];
  saveKeys(keys);
}

/**
 * Get an API key from the config file by name
 * @param name Name of the API key
 * @returns The key if the name is found, undefined otherwise
 */
export function getKey(name: string): string | undefined {
  const keys = getAllKeys();
  return keys[name];
}
