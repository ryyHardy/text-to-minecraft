/**
 * Config for securely storing secrets locally (such as API keys for the AI or anything that needs encryption)
 */

import { app, safeStorage } from "electron";
import * as fs from "fs";
import * as path from "path";

const USER_DATA_PATH = app.getPath("userData");
const SECRETS_PATH = path.join(USER_DATA_PATH, "secrets.enc");

function getAllSecrets(): Record<string, string> {
  if (!fs.existsSync(SECRETS_PATH)) {
    return {};
  }

  try {
    const encrypted = fs.readFileSync(SECRETS_PATH);
    const decrypted = safeStorage.decryptString(encrypted);

    return JSON.parse(decrypted) as Record<string, string>;
  } catch (error) {
    console.error("Error reading secrets from secrets.enc", error);
    return {};
  }
}

/**
 * Saves a record of secrets to config file
 * @param secrets Record mapping names to secret values
 */
function saveSecrets(secrets: Record<string, string>) {
  const json = JSON.stringify(secrets);
  const encrypted = safeStorage.encryptString(json);
  fs.writeFileSync(SECRETS_PATH, encrypted);
}

/**
 * Sets a [name,secret] pair and writes it to config file (encrypted, of course)
 * @param name Name of the secret
 * @param secret The secret itself
 */
export function setSecret(name: string, secret: string) {
  const secrets = getAllSecrets();
  secrets[name] = secret;
  saveSecrets(secrets);
}

/**
 * Remove the secret associated with a given name from the config file
 * @param name The name of the secret to remove
 */
export function removeSecret(name: string) {
  const secrets = getAllSecrets();
  delete secrets[name];
  saveSecrets(secrets);
}

/**
 * Get a secret from the config file by name
 * @param name Name of the secret
 * @returns The secret value if the name is found, undefined otherwise
 */
export function getSecret(name: string): string | undefined {
  const secrets = getAllSecrets();
  return secrets[name];
}
