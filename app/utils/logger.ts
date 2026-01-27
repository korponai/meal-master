/**
 * Centralized logging utility
 * Provides consistent logging across the application with environment-aware behavior
 */

const isDev = process.env.NODE_ENV === "development";

interface LoggerOptions {
  timestamp?: boolean;
  context?: string;
}

/**
 * Format log message with optional timestamp and context
 */
const formatMessage = (
  level: string,
  message: string,
  context?: string,
): string => {
  const timestamp = new Date().toISOString();
  const ctx = context ? `[${context}]` : "";
  return `${timestamp} [${level}]${ctx} ${message}`;
};

export const logger = {
  /**
   * Debug level logging - only visible in development
   * @param message - The debug message
   * @param data - Optional data to log
   * @param options - Logging options
   */
  debug: (message: string, data?: unknown, options?: LoggerOptions) => {
    if (isDev) {
      const formatted = formatMessage("DEBUG", message, options?.context);
      if (data !== undefined) {
        console.log(formatted, data);
      } else {
        console.log(formatted);
      }
    }
  },

  /**
   * Info level logging - visible in all environments
   * @param message - The info message
   * @param data - Optional data to log
   * @param options - Logging options
   */
  info: (message: string, data?: unknown, options?: LoggerOptions) => {
    const formatted = formatMessage("INFO", message, options?.context);
    if (data !== undefined) {
      console.log(formatted, data);
    } else {
      console.log(formatted);
    }
  },

  /**
   * Warning level logging
   * @param message - The warning message
   * @param data - Optional data to log
   * @param options - Logging options
   */
  warn: (message: string, data?: unknown, options?: LoggerOptions) => {
    const formatted = formatMessage("WARN", message, options?.context);
    if (data !== undefined) {
      console.warn(formatted, data);
    } else {
      console.warn(formatted);
    }
  },

  /**
   * Error level logging
   * @param message - The error message
   * @param error - Optional error object or data
   * @param options - Logging options
   */
  error: (message: string, error?: unknown, options?: LoggerOptions) => {
    const formatted = formatMessage("ERROR", message, options?.context);
    if (error !== undefined) {
      console.error(formatted, error);
    } else {
      console.error(formatted);
    }
  },
};
