import { describe, expect, it } from 'vitest';
import { handler } from './handler';

describe('products-admin handler', () => {
  it('returns 200 with flow id', async () => {
    const result = await handler({ rawPath: '/admin/products' } as Parameters<typeof handler>[0]);

    const body = JSON.parse((result as { body: string }).body);
    expect(body).toMatchObject({ ok: true, flow: 'products-admin' });
  });
});
