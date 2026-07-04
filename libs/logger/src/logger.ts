import { ConsoleLogger } from './console-logger';
import type { LogContext, Logger } from './types';

let defaultLogger: Logger | undefined;

export function createLogger(bindings?: LogContext): Logger {
  return new ConsoleLogger(bindings ?? {});
}

export function getLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = createLogger();
  }

  return defaultLogger;
}
