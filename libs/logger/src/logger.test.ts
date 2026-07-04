import { describe, expect, it } from 'vitest';
import { createLogger, getLogger } from './logger';

describe('logger factory', () => {
  it('returns the same default logger instance', () => {
    expect(getLogger()).toBe(getLogger());
  });

  it('creates loggers with optional bindings', () => {
    const logger = createLogger({ module: 'test' });
    expect(logger.child({ foo: 'bar' })).toBeDefined();
  });
});
