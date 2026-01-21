import type { LogLevel } from "./config.js";

type LoggerOptions = {
  level: LogLevel;
  serviceName: string;
};

type LogPayload = Record<string, unknown>;

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const shouldLog = (configured: LogLevel, incoming: LogLevel) =>
  LEVEL_PRIORITY[incoming] >= LEVEL_PRIORITY[configured];

const formatPayload = (
  level: LogLevel,
  serviceName: string,
  message: string,
  payload?: LogPayload,
) => ({
  timestamp: new Date().toISOString(),
  level,
  service: serviceName,
  message,
  ...payload,
});

export const createLogger = ({ level, serviceName }: LoggerOptions) => {
  const write = (incoming: LogLevel, message: string, payload?: LogPayload) => {
    if (!shouldLog(level, incoming)) {
      return;
    }

    const entry = formatPayload(incoming, serviceName, message, payload);

    if (incoming === "error") {
      console.error(JSON.stringify(entry));
      return;
    }

    if (incoming === "warn") {
      console.warn(JSON.stringify(entry));
      return;
    }

    console.info(JSON.stringify(entry));
  };

  return {
    debug: (message: string, payload?: LogPayload) =>
      write("debug", message, payload),
    info: (message: string, payload?: LogPayload) =>
      write("info", message, payload),
    warn: (message: string, payload?: LogPayload) =>
      write("warn", message, payload),
    error: (message: string, payload?: LogPayload) =>
      write("error", message, payload),
  };
};
