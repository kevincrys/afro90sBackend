import { describe, expect, it } from 'vitest';
import { getSessionId, runWithSession } from './session';

describe('session', () => {
  it('returns session id inside runWithSession', async () => {
    await runWithSession('abc', async () => {
      expect(getSessionId()).toBe('abc');
    });
  });

  it('returns undefined outside runWithSession', () => {
    expect(getSessionId()).toBeUndefined();
  });
});
