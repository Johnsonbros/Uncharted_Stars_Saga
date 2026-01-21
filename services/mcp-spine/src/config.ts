export type ServiceEnvironment = "development" | "staging" | "production" | "test";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type ServiceConfig = {
  serviceName: string;
  port: number;
  environment: ServiceEnvironment;
  logLevel: LogLevel;
  startupWarnings: string[];
};

const DEFAULT_PORT = 7000;
const DEFAULT_ENVIRONMENT: ServiceEnvironment = "development";
const DEFAULT_LOG_LEVEL: LogLevel = "info";

const LOG_LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];
const ENVIRONMENTS: ServiceEnvironment[] = [
  "development",
  "staging",
  "production",
  "test",
];

const normalizeString = (value: string | undefined) => value?.trim();

const parsePort = (value: string | undefined, warnings: string[]) => {
  if (!value) {
    return DEFAULT_PORT;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > 65535) {
    warnings.push(
      `MCP_SPINE_PORT must be an integer between 1 and 65535. Received "${value}". Using default ${DEFAULT_PORT}.`,
    );
    return DEFAULT_PORT;
  }

  return parsed;
};

const parseEnvironment = (
  value: string | undefined,
  warnings: string[],
): ServiceEnvironment => {
  if (!value) {
    return DEFAULT_ENVIRONMENT;
  }

  const normalized = value.toLowerCase();
  if (!ENVIRONMENTS.includes(normalized as ServiceEnvironment)) {
    warnings.push(
      `SERVICE_ENV must be one of ${ENVIRONMENTS.join(
        ", ",
      )}. Received "${value}". Using default ${DEFAULT_ENVIRONMENT}.`,
    );
    return DEFAULT_ENVIRONMENT;
  }

  return normalized as ServiceEnvironment;
};

const parseLogLevel = (value: string | undefined, warnings: string[]): LogLevel => {
  if (!value) {
    return DEFAULT_LOG_LEVEL;
  }

  const normalized = value.toLowerCase();
  if (!LOG_LEVELS.includes(normalized as LogLevel)) {
    warnings.push(
      `LOG_LEVEL must be one of ${LOG_LEVELS.join(
        ", ",
      )}. Received "${value}". Using default ${DEFAULT_LOG_LEVEL}.`,
    );
    return DEFAULT_LOG_LEVEL;
  }

  return normalized as LogLevel;
};

export const loadConfig = (serviceName = "mcp-spine"): ServiceConfig => {
  const warnings: string[] = [];
  const port = parsePort(normalizeString(process.env.MCP_SPINE_PORT), warnings);
  const environment = parseEnvironment(
    normalizeString(process.env.SERVICE_ENV),
    warnings,
  );
  const logLevel = parseLogLevel(normalizeString(process.env.LOG_LEVEL), warnings);

  return {
    serviceName,
    port,
    environment,
    logLevel,
    startupWarnings: warnings,
  };
};
