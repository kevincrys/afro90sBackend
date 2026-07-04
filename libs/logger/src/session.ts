import { AsyncLocalStorage } from 'node:async_hooks';

const sessionStorage = new AsyncLocalStorage<string>();

export function runWithSession<T>(sessionId: string, fn: () => Promise<T>): Promise<T> {
  return sessionStorage.run(sessionId, fn);
}

export function getSessionId(): string | undefined {
  return sessionStorage.getStore();
}
