import { describe, expect, it, vi } from 'vitest';
import { ConsoleLogger } from './console-logger';
import { runWithSession } from './session';

describe('ConsoleLogger', () => {
  it('emits parseable JSON with level and message', () => {
    process.env.LOG_LEVEL = 'debug';
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const logger = new ConsoleLogger();
    logger.info('hello', { foo: 'bar' });

    expect(logSpy).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(logSpy.mock.calls[0][0]));
    expect(payload).toMatchObject({
      level: 'info',
      message: 'hello',
      foo: 'bar',
    });
    expect(payload.timestamp).toBeDefined();

    logSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });

  it('suppresses debug when LOG_LEVEL is info', () => {
    process.env.LOG_LEVEL = 'info';
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

    new ConsoleLogger().debug('hidden');

    expect(debugSpy).not.toHaveBeenCalled();

    debugSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });

  it('merges child bindings into log context', () => {
    process.env.LOG_LEVEL = 'info';
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const logger = new ConsoleLogger({ module: 'orders-public' }).child({ component: 'email' });
    logger.info('sent');

    const payload = JSON.parse(String(logSpy.mock.calls[0][0]));
    expect(payload).toMatchObject({
      module: 'orders-public',
      component: 'email',
      message: 'sent',
    });

    logSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });

  it('includes sessionId from runWithSession', async () => {
    process.env.LOG_LEVEL = 'info';
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await runWithSession('req-123', async () => {
      new ConsoleLogger().info('in request');
    });

    const payload = JSON.parse(String(logSpy.mock.calls[0][0]));
    expect(payload.sessionId).toBe('req-123');

    logSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });
});
