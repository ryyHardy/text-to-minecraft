import { useEffect, useState } from "react";

type LogEvent = {
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  category: string;
  bot?: string;
  message: string;
  data?: any;
};

const LogLength = 500;

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEvent[]>([]);

  useEffect(() => {
    const handler = (e: LogEvent) =>
      setLogs(prev => [e, ...prev].slice(0, LogLength));
    window.textmc.onLogEvent(handler);
  }, []);

  return (
    <div className='h-fit overflow-auto text-sm'>
      {logs.map((e, i) => (
        <div key={i}>
          [{new Date(e.timestamp).toLocaleTimeString()}] [{e.level}] [
          {e.category}] {e.bot ? `[${e.bot}] ` : ""} {e.message}
        </div>
      ))}
    </div>
  );
}
