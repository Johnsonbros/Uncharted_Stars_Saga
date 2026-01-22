import type { Logger } from "../src/types/loggerTypes.js";

type LogEntry = {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  payload?: Record<string, unknown>;
};

export const createTestLogger = () => {
  const entries: LogEntry[] = [];

  const logger: Logger = {
    debug: (message, payload) => entries.push({ level: "debug", message, payload }),
    info: (message, payload) => entries.push({ level: "info", message, payload }),
    warn: (message, payload) => entries.push({ level: "warn", message, payload }),
    error: (message, payload) => entries.push({ level: "error", message, payload }),
  };

  return { logger, entries };
};
