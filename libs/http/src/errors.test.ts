import { describe, expect, it } from 'vitest';
import { ZodError, z } from 'zod';
import { ApiError } from '@afro90s/models';
import {
  throwForbidden,
  throwInsufficientStock,
  throwInvalidCursor,
  throwInvalidStatusTransition,
  throwNotFound,
  throwUnauthorized,
  throwValidationError,
  toErrorResponse,
  zodErrorToDetails,
} from './errors';

const REQUEST_ID = 'req-test';

describe('toErrorResponse', () => {
  it('maps VALIDATION_ERROR to 400 with details', () => {
    const error = new ApiError('VALIDATION_ERROR', 'Dados inválidos.', { email: 'required' });
    const result = toErrorResponse(error, REQUEST_ID);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body as string)).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos.',
      requestId: REQUEST_ID,
      details: { email: 'required' },
    });
  });

  it('maps NOT_FOUND to 404', () => {
    const error = new ApiError('NOT_FOUND', 'Produto não encontrado.');
    const result = toErrorResponse(error, REQUEST_ID);
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body as string)).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Produto não encontrado.',
    });
  });
});

describe('throw helpers', () => {
  it('throwValidationError throws ApiError', () => {
    expect(() => throwValidationError({ name: 'required' })).toThrow(ApiError);
    try {
      throwValidationError({ name: 'required' });
    } catch (error) {
      expect(error).toMatchObject({ code: 'VALIDATION_ERROR', statusCode: 400 });
    }
  });

  it('throwNotFound throws 404', () => {
    try {
      throwNotFound('Pedido não encontrado.');
    } catch (error) {
      expect(error).toMatchObject({ code: 'NOT_FOUND', statusCode: 404 });
    }
  });

  it('throwUnauthorized throws 401', () => {
    try {
      throwUnauthorized();
    } catch (error) {
      expect(error).toMatchObject({ code: 'UNAUTHORIZED', statusCode: 401 });
    }
  });

  it('throwForbidden throws 403', () => {
    try {
      throwForbidden();
    } catch (error) {
      expect(error).toMatchObject({ code: 'FORBIDDEN', statusCode: 403 });
    }
  });

  it('throwInsufficientStock throws 409', () => {
    try {
      throwInsufficientStock();
    } catch (error) {
      expect(error).toMatchObject({ code: 'INSUFFICIENT_STOCK', statusCode: 409 });
    }
  });

  it('throwInvalidCursor throws 400', () => {
    try {
      throwInvalidCursor();
    } catch (error) {
      expect(error).toMatchObject({ code: 'INVALID_CURSOR', statusCode: 400 });
    }
  });

  it('throwInvalidStatusTransition throws 409', () => {
    try {
      throwInvalidStatusTransition();
    } catch (error) {
      expect(error).toMatchObject({ code: 'INVALID_STATUS_TRANSITION', statusCode: 409 });
    }
  });
});

describe('zodErrorToDetails', () => {
  it('maps Zod issues to field paths', () => {
    const schema = z.object({ name: z.string().min(2) });
    try {
      schema.parse({ name: 'A' });
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(zodErrorToDetails(error as ZodError)).toHaveProperty('name');
    }
  });
});
