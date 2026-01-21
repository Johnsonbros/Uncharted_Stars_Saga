import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";

const config = loadConfig();
const logger = createLogger({
  level: config.logLevel,
  serviceName: config.serviceName,
});

logger.info("MCP spine scaffold initialized.", {
  environment: config.environment,
  port: config.port,
});

if (config.startupWarnings.length > 0) {
  for (const warning of config.startupWarnings) {
    logger.warn("Startup configuration warning.", { warning });
  }
}

logger.info("Next steps: register MCP resources/tools and bootstrap server runtime.");
