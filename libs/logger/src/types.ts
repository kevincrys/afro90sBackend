export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, string | number | boolean | undefined>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(bindings: LogContext): Logger;
}
