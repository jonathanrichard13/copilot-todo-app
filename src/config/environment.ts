import * as path from "path";

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  LOG_LEVEL: string;
  CORS_ORIGIN: string;
}

/**
 * Load and validate environment configuration
 */
export const loadEnvironmentConfig = (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "3000", 10),
    DATABASE_URL: process.env.DATABASE_URL || path.join(process.cwd(), "data", "todo.db"),
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  };

  // Validate required configuration
  if (!config.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (isNaN(config.PORT) || config.PORT < 1 || config.PORT > 65535) {
    throw new Error("PORT must be a valid port number (1-65535)");
  }

  return config;
};

/**
 * Get current environment configuration
 */
export const env = loadEnvironmentConfig();
