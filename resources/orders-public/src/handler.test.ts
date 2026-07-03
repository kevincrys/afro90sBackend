import { describe, expect, it } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { handler } from './handler';

function apiEvent(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
  return {
    rawPath: '/orders',
    headers: {},
    requestContext: { http: { method: 'GET' } },
    ...overrides,
  } as APIGatewayProxyEventV2;
}

describe('orders-public handler', () => {
  it('returns 200 with flow id', async () => {
    const result = await handler(apiEvent(), {} as Context);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body as string);
    expect(body).toMatchObject({ ok: true, flow: 'orders-public', path: '/orders' });
  });
});
