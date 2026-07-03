import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { handler } from './handler';

const createOrder = vi.fn();

vi.mock('./services/order.service', () => ({
  createOrder: (...args: unknown[]) => createOrder(...args),
}));

const customer = {
  name: 'Maria Silva',
  address: 'Rua das Flores 123',
  postalCode: '01310100',
  tel: '11999998888',
};

function apiEvent(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
  return {
    rawPath: '/orders',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      customer,
      items: [{ productId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 }],
    }),
    requestContext: { http: { method: 'POST' } },
    ...overrides,
  } as APIGatewayProxyEventV2;
}

describe('orders-public handler', () => {
  beforeEach(() => {
    createOrder.mockReset();
  });

  it('routes POST /orders', async () => {
    createOrder.mockResolvedValueOnce({
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      status: 'SOLICITADO',
      fullPrice: 89.9,
    });

    const result = await handler(apiEvent(), {} as Context);
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body as string)).toMatchObject({
      status: 'SOLICITADO',
      fullPrice: 89.9,
    });
  });

  it('returns 400 for invalid body', async () => {
    const result = await handler(
      apiEvent({ body: JSON.stringify({ customer, items: [] }) }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body as string).code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 for unknown routes', async () => {
    const result = await handler(
      apiEvent({ rawPath: '/unknown', requestContext: { http: { method: 'GET' } } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(404);
  });

  it('responds to OPTIONS with 204', async () => {
    const result = await handler(
      apiEvent({ requestContext: { http: { method: 'OPTIONS' } } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(204);
  });
});
