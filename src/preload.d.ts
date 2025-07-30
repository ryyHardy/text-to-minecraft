export interface TextMCAPI {
  connectBot: (
    host: string,
    port: number,
    username: string,
    exclusiveUsers?: string[]
  ) => Promise<{ success: boolean; username?: string; error?: string }>;

  disconnectBot: (
    username: string
  ) => Promise<{ success: boolean; error?: string }>;

  getBotStatus: (username: string) => Promise<{ connected: boolean }>;

  onBotDisconnected: (
    callback: (data: { username: string; reason: string }) => void
  ) => void;
}

declare global {
  interface Window {
    textmc: TextMCAPI;
  }
}
