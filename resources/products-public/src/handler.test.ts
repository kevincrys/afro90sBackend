import { describe, expect, it } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { handler } from './handler';

function apiEvent(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
  return {
    rawPath: '/products',
    headers: {},
    requestContext: { http: { method: 'GET' } },
    ...overrides,
  } as APIGatewayProxyEventV2;
}

describe('products-public handler', () => {
  it('returns 200 with flow id and request headers', async () => {
    const result = await handler(apiEvent(), {} as Context);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Content-Type']).toBe('application/json; charset=utf-8');
    expect(result.headers?.['X-Request-Id']).toBeDefined();
    expect(result.headers?.['Access-Control-Allow-Origin']).toBeDefined();

    const body = JSON.parse(result.body as string);
    expect(body).toMatchObject({ ok: true, flow: 'products-public', path: '/products' });
  });

  it('echoes client X-Request-Id', async () => {
    const result = await handler(
      apiEvent({ headers: { 'x-request-id': 'client-req-id' } }),
      {} as Context,
    );
    expect(result.headers?.['X-Request-Id']).toBe('client-req-id');
  });

  it('responds to OPTIONS with 204', async () => {
    const result = await handler(
      apiEvent({ requestContext: { http: { method: 'OPTIONS' } } } as APIGatewayProxyEventV2),
      {} as Context,
    );
    expect(result.statusCode).toBe(204);
  });
});
