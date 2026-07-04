import { resolveLogLevel, shouldLog } from './level';
import { getSessionId } from './session';
import type { LogContext, LogLevel, Logger } from './types';

function writeLog(level: LogLevel, line: string): void {
  switch (level) {
    case 'debug':
      console.debug(line);
      break;
    case 'info':
      console.log(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    case 'error':
      console.error(line);
      break;
  }
}

export class ConsoleLogger implements Logger {
  constructor(private readonly bindings: LogContext = {}) {}

  debug(message: string, context?: LogContext): void {
    this.emit('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.emit('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.emit('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.emit('error', message, context);
  }

  child(bindings: LogContext): Logger {
    return new ConsoleLogger({ ...this.bindings, ...bindings });
  }

  private emit(level: LogLevel, message: string, context?: LogContext): void {
    if (!shouldLog(level, resolveLogLevel())) {
      return;
    }

    const sessionId = getSessionId();
    const payload: Record<string, string | number | boolean> = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.bindings,
      ...context,
    };

    if (sessionId) {
      payload.sessionId = sessionId;
    }

    writeLog(level, JSON.stringify(payload));
  }
}
