import { describe, expect, it } from 'vitest';
import { ApiError, statusForApiErrorCode } from './errors';

describe('ApiError', () => {
  it('maps code to HTTP status', () => {
    expect(statusForApiErrorCode('NOT_FOUND')).toBe(404);
    expect(statusForApiErrorCode('VALIDATION_ERROR')).toBe(400);
    expect(statusForApiErrorCode('INSUFFICIENT_STOCK')).toBe(409);
    expect(statusForApiErrorCode('INTERNAL_ERROR')).toBe(500);
  });

  it('carries code, status and details', () => {
    const error = new ApiError('VALIDATION_ERROR', 'Dados inválidos.', { name: 'required' });
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ name: 'required' });
    expect(error.message).toBe('Dados inválidos.');
  });
});
