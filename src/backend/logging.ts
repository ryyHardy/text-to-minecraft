export type LogLevel = "info" | "warn" | "error" | "debug";

export type LogCategory =
  | "connection"
  | "chat"
  | "command"
  | "move"
  | "build"
  | "system";

export type LogEvent = {
  timestamp: number; // Date.now()
  level: LogLevel;
  category: LogCategory;
  bot?: string; // username if needed
  message: string;
  data?: any; // optional structured payload
};

type Listener = (e: LogEvent) => void;

const listeners = new Set<Listener>();

export function on(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emit(event: LogEvent) {
  for (const li of listeners) li(event);
}

export function log(event: Omit<LogEvent, "timestamp">) {
  emit({ timestamp: Date.now(), ...event });
}

class Logger {
  info(event: Omit<LogEvent, "timestamp" | "level">) {
    log({ level: "info", ...event });
  }

  warn(event: Omit<LogEvent, "timestamp" | "level">) {
    log({ level: "warn", ...event });
  }

  error(event: Omit<LogEvent, "timestamp" | "level">) {
    log({ level: "error", ...event });
  }

  debug(event: Omit<LogEvent, "timestamp" | "level">) {
    log({ level: "debug", ...event });
  }
}

export const logger = new Logger();
