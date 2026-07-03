import { afterEach, describe, expect, it } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { createHandler } from './handler';
import { ok } from './response';

function apiEvent(method = 'GET'): APIGatewayProxyEventV2 {
  return {
    headers: {},
    requestContext: { http: { method } },
  } as APIGatewayProxyEventV2;
}

describe('createHandler', () => {
  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it('returns 500 when handler throws', async () => {
    const handler = createHandler(async () => {
      throw new Error('boom');
    });

    const result = await handler(apiEvent(), {} as Context);
    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body as string);
    expect(body).toMatchObject({
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor.',
    });
  });

  it('wraps successful responses with CORS', async () => {
    const handler = createHandler(async (_event, { requestId }) => ok({ ok: true }, requestId));

    const result = await handler(apiEvent(), {} as Context);
    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Access-Control-Allow-Origin']).toBeDefined();
  });
});
