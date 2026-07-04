import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parseLogLevel, resolveLogLevel, shouldLog } from './level';

describe('log level', () => {
  beforeEach(() => {
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
  });

  it('parses valid levels case-insensitively', () => {
    expect(parseLogLevel('DEBUG')).toBe('debug');
    expect(parseLogLevel('Info')).toBe('info');
  });

  it('returns undefined for invalid levels', () => {
    expect(parseLogLevel('trace')).toBeUndefined();
  });

  it('defaults to debug in development', () => {
    process.env.NODE_ENV = 'development';
    expect(resolveLogLevel()).toBe('debug');
  });

  it('defaults to error outside development', () => {
    expect(resolveLogLevel()).toBe('error');
  });

  it('allows LOG_LEVEL override on Lambda (prod default stays error)', () => {
    process.env.NODE_ENV = 'production';
    expect(resolveLogLevel()).toBe('error');

    process.env.LOG_LEVEL = 'info';
    expect(resolveLogLevel()).toBe('info');
  });

  it('filters messages below configured level', () => {
    expect(shouldLog('debug', 'info')).toBe(false);
    expect(shouldLog('warn', 'info')).toBe(true);
    expect(shouldLog('error', 'error')).toBe(true);
  });
});
