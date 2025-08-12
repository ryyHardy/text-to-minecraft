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

  getBotStatus: (username: string) => {
    connected: boolean;
    // TODO: Add types for any newly-added status data
  };

  onBotDisconnected: (
    callback: (username: string, reason: string) => void
  ) => void;
}

declare global {
  interface Window {
    textmc: TextMCAPI;
  }
}
