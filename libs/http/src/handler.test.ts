import { afterEach, describe, expect, it } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { z } from 'zod';
import { ApiError } from '@afro90s/models';
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
    expect(body.requestId).toBeDefined();
  });

  it('returns ApiError status and body', async () => {
    const handler = createHandler(async () => {
      throw new ApiError('NOT_FOUND', 'Produto não encontrado.');
    });

    const result = await handler(apiEvent(), {} as Context);
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body as string)).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Produto não encontrado.',
    });
  });

  it('converts ZodError to VALIDATION_ERROR', async () => {
    const schema = z.object({ name: z.string().min(2) });
    const handler = createHandler(async () => {
      schema.parse({ name: 'A' });
      return ok({}, 'unused');
    });

    const result = await handler(apiEvent(), {} as Context);
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body as string);
    expect(body).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos.',
    });
    expect(body.details).toHaveProperty('name');
  });

  it('wraps successful responses with CORS', async () => {
    const handler = createHandler(async (_event, { requestId }) => ok({ ok: true }, requestId));

    const result = await handler(apiEvent(), {} as Context);
    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Access-Control-Allow-Origin']).toBeDefined();
  });
});
