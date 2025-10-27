/**
 * Logger Utility
 * Provides colored console logging for different log levels
 */

import { config } from "@/config/env.config";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

/**
 * Format timestamp
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Logger class with colored output
 */
class Logger {
  /**
   * Info level log (blue)
   */
  info(message: string, ...args: any[]): void {
    if (config.isDevelopment || config.logging.level === "info") {
      console.info(
        `${colors.cyan}[INFO]${colors.reset} ${colors.bright}${getTimestamp()}${
          colors.reset
        } - ${message}`,
        ...args
      );
    }
  }

  /**
   * Success level log (green)
   */
  success(message: string, ...args: any[]): void {
    console.info(
      `${colors.green}[SUCCESS]${colors.reset} ${
        colors.bright
      }${getTimestamp()}${colors.reset} - ${message}`,
      ...args
    );
  }

  /**
   * Warning level log (yellow)
   */
  warn(message: string, ...args: any[]): void {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${colors.bright}${getTimestamp()}${
        colors.reset
      } - ${message}`,
      ...args
    );
  }

  /**
   * Error level log (red)
   */
  error(message: string, ...args: any[]): void {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${colors.bright}${getTimestamp()}${
        colors.reset
      } - ${message}`,
      ...args
    );
  }

  /**
   * Debug level log (magenta)
   */
  debug(message: string, ...args: any[]): void {
    if (config.isDevelopment) {
      console.log(
        `${colors.magenta}[DEBUG]${colors.reset} ${
          colors.bright
        }${getTimestamp()}${colors.reset} - ${message}`,
        ...args
      );
    }
  }

  /**
   * HTTP request log (cyan)
   */
  http(message: string, ...args: any[]): void {
    console.log(
      `${colors.blue}[HTTP]${colors.reset} ${colors.bright}${getTimestamp()}${
        colors.reset
      } - ${message}`,
      ...args
    );
  }
}

// Export singleton instance
export const logger = new Logger();
