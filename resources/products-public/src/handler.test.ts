import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { handler } from './handler';

const list = vi.fn();

vi.mock('@afro90s/repositories', () => ({
  getProductRepository: () => ({ list }),
  toPublicProduct: (product: Record<string, unknown>) => product,
}));

function apiEvent(
  overrides: Partial<APIGatewayProxyEventV2> = {},
): APIGatewayProxyEventV2 {
  return {
    rawPath: '/products',
    headers: {},
    queryStringParameters: {},
    requestContext: { http: { method: 'GET' } },
    ...overrides,
  } as APIGatewayProxyEventV2;
}

describe('products-public handler', () => {
  beforeEach(() => {
    list.mockReset();
    process.env.PRODUCTS_TABLE = 'test-products';
  });

  it('routes GET /products', async () => {
    list.mockResolvedValueOnce({
      items: [],
      index: 'gsi-createdAt',
      filters: {},
    });

    const result = await handler(apiEvent(), {} as Context);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body as string)).toMatchObject({ items: [], hasMore: false });
  });

  it('returns 404 for unknown routes', async () => {
    const result = await handler(
      apiEvent({ rawPath: '/unknown', requestContext: { http: { method: 'GET' } } } as APIGatewayProxyEventV2),
      {} as Context,
    );
    expect(result.statusCode).toBe(404);
  });

  it('responds to OPTIONS with 204', async () => {
    const result = await handler(
      apiEvent({ requestContext: { http: { method: 'OPTIONS' } } } as APIGatewayProxyEventV2),
      {} as Context,
    );
    expect(result.statusCode).toBe(204);
  });
});
