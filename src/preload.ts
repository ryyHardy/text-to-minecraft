// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

function setSecret(name: string, value: string) {
  ipcRenderer.invoke("set-secret", name, value);
}

function secretExists(name: string) {
  return ipcRenderer.invoke("secret-exists", name);
}

function removeSecret(name: string) {
  return ipcRenderer.invoke("remove-secret", name);
}

function validateLLMKey(key: string) {
  return ipcRenderer.invoke("validate-llm-key", key);
}

function connectBot(
  host: string,
  port: number,
  username: string,
  exclusiveUsers: string[] = []
) {
  return ipcRenderer.invoke(
    "connect-bot",
    host,
    port,
    username,
    exclusiveUsers
  );
}

function disconnectBot(username: string) {
  return ipcRenderer.invoke("disconnect-bot", username);
}

function getBotStatus(username: string) {
  return ipcRenderer.invoke("get-bot-status", username);
}

contextBridge.exposeInMainWorld("textmc", {
  setSecret: setSecret,
  secretExists: secretExists,
  removeSecret: removeSecret,

  validateLLMKey: validateLLMKey,

  connectBot: connectBot,
  disconnectBot: disconnectBot,
  getBotStatus: getBotStatus,

  onBotDisconnected: (callback: (username: string, reason: string) => void) => {
    ipcRenderer.on("bot-disconnected", (_, username, reason) => {
      callback(username, reason);
    });
  },

  onLogEvent: (callback: (event: any) => void) => {
    ipcRenderer.on("log-event", (_, e) => callback(e));
  },
});
