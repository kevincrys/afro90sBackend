import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ApiError } from '@afro90s/models';
import { handlePostOrders } from './post-orders';

const createOrder = vi.fn();

vi.mock('../services/order.service', () => ({
  createOrder: (...args: unknown[]) => createOrder(...args),
}));

const context = { requestId: 'req-1' } as Parameters<typeof handlePostOrders>[1];

function event(body?: string): APIGatewayProxyEventV2 {
  return {
    body,
    requestContext: { http: { method: 'POST' } },
  } as APIGatewayProxyEventV2;
}

describe('handlePostOrders', () => {
  beforeEach(() => {
    createOrder.mockReset();
  });

  it('rejects missing body', async () => {
    await expect(handlePostOrders(event(), context)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    } satisfies Partial<ApiError>);
  });

  it('rejects invalid JSON', async () => {
    await expect(handlePostOrders(event('{'), context)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    });
  });
});
