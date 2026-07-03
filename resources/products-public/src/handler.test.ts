import { describe, expect, it } from 'vitest';
import { handler } from './handler';

describe('products-public handler', () => {
  it('returns 200 with flow id', async () => {
    const result = await handler({ rawPath: '/products' } as Parameters<typeof handler>[0]);

    expect(result).toMatchObject({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
    });

    const body = JSON.parse((result as { body: string }).body);
    expect(body).toMatchObject({ ok: true, flow: 'products-public', path: '/products' });
  });
});
