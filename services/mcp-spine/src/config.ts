export type ServiceEnvironment = "development" | "staging" | "production" | "test";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type ServiceConfig = {
  serviceName: string;
  port: number;
  environment: ServiceEnvironment;
  logLevel: LogLevel;
  accessToken?: string;
  anthropicApiKey?: string;
  rateLimitPerMinute: number;
  startupWarnings: string[];
};

const DEFAULT_PORT = 7000;
const DEFAULT_ENVIRONMENT: ServiceEnvironment = "development";
const DEFAULT_LOG_LEVEL: LogLevel = "info";
const DEFAULT_RATE_LIMIT = 60;

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

const parseRateLimit = (value: string | undefined, warnings: string[]) => {
  if (!value) {
    return DEFAULT_RATE_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    warnings.push(
      `MCP_RATE_LIMIT_PER_MINUTE must be a positive integer. Received "${value}". Using default ${DEFAULT_RATE_LIMIT}.`,
    );
    return DEFAULT_RATE_LIMIT;
  }

  return parsed;
};

const parseAccessToken = (value: string | undefined) => normalizeString(value);

export const loadConfig = (serviceName = "mcp-spine"): ServiceConfig => {
  const warnings: string[] = [];
  const port = parsePort(normalizeString(process.env.MCP_SPINE_PORT), warnings);
  const environment = parseEnvironment(
    normalizeString(process.env.SERVICE_ENV),
    warnings,
  );
  const logLevel = parseLogLevel(normalizeString(process.env.LOG_LEVEL), warnings);
  const accessToken = parseAccessToken(
    normalizeString(process.env.MCP_SPINE_ACCESS_TOKEN),
  );
  const rateLimitPerMinute = parseRateLimit(
    normalizeString(process.env.MCP_RATE_LIMIT_PER_MINUTE),
    warnings,
  );
  const anthropicApiKey = normalizeString(process.env.ANTHROPIC_API_KEY);

  return {
    serviceName,
    port,
    environment,
    logLevel,
    accessToken: accessToken || undefined,
    anthropicApiKey: anthropicApiKey || undefined,
    rateLimitPerMinute,
    startupWarnings: warnings,
  };
};
