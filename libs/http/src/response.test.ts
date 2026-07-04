import { describe, expect, it } from 'vitest';
import { apiError, created, internalError, noContent, ok } from './response';

const REQUEST_ID = 'test-request-id';

describe('response helpers', () => {
  it('ok returns 200 with JSON body and headers', () => {
    const result = ok({ items: [] }, REQUEST_ID);
    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Content-Type']).toBe('application/json; charset=utf-8');
    expect(result.headers?.['X-Request-Id']).toBe(REQUEST_ID);
    expect(JSON.parse(result.body as string)).toEqual({ items: [] });
  });

  it('created returns 201', () => {
    const result = created({ id: '1' }, REQUEST_ID);
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body as string)).toEqual({ id: '1' });
  });

  it('noContent returns 204 without body', () => {
    const result = noContent(REQUEST_ID);
    expect(result.statusCode).toBe(204);
    expect(result.body).toBe('');
  });

  it('apiError returns structured error with requestId only', () => {
    const result = apiError(400, 'VALIDATION_ERROR', 'Campo inválido.', REQUEST_ID);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body as string)).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'Campo inválido.',
      requestId: REQUEST_ID,
    });
  });

  it('internalError returns 500 in pt-BR', () => {
    const result = internalError(REQUEST_ID);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body as string)).toMatchObject({
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor.',
      requestId: REQUEST_ID,
    });
  });
});
