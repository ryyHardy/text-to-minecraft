// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("textmc", {
  connectBot: async (
    host: string,
    port: number,
    username: string,
    exclusiveUsers: string[] = []
  ) => {
    return ipcRenderer.invoke("connect-bot", {
      host,
      port,
      username,
      exclusiveUsers,
    });
  },

  disconnectBot: async (username: string) => {
    return ipcRenderer.invoke("disconnect-bot", username);
  },

  getBotStatus: async (username: string) => {
    return ipcRenderer.invoke("get-bot-status", username);
  },

  onBotDisconnected: (
    callback: (data: { username: string; reason: string }) => void
  ) => {
    ipcRenderer.on("bot-disconnected", (_, data) => callback(data));
  },
});
