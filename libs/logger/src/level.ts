import type { LogLevel } from './types';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const VALID_LEVELS = new Set<string>(Object.keys(LEVEL_PRIORITY));

export function parseLogLevel(value: string | undefined): LogLevel | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();
  return VALID_LEVELS.has(normalized) ? (normalized as LogLevel) : undefined;
}

export function resolveLogLevel(): LogLevel {
  // LOG_LEVEL na env da Lambda (ou local) sobrescreve o default.
  const fromEnv = parseLogLevel(process.env.LOG_LEVEL);
  if (fromEnv) {
    return fromEnv;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'debug';
  }

  // Prod/Lambda sem LOG_LEVEL: só emite error (reduz volume CloudWatch).
  return 'error';
}

export function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[minLevel];
}
