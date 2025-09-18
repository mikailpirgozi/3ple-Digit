/**
 * Frontend logger utility
 * Provides structured logging for the frontend application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // In development, use console for better debugging
    if (this.isDevelopment) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      // eslint-disable-next-line no-console
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context ?? '');
      return;
    }

    // In production, you could send to external service (Sentry, LogRocket, etc.)
    // For now, just use console with structured format
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](JSON.stringify(logEntry));
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  /**
   * Log API errors with structured format
   */
  apiError(operation: string, error: unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.error(`API Error: ${operation}`, {
      operation,
      error: errorMessage,
      stack: errorStack,
      ...context,
    });
  }

  /**
   * Log user actions for analytics
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      action,
      ...context,
    });
  }
}

export const logger = new Logger();
