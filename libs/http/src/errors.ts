import { ZodError, z } from 'zod';
import { raiseApiError } from '@afro90s/models';
import type { ApiError } from '@afro90s/models';
import { apiError } from './response';

export function zodErrorToDetails(error: ZodError): Record<string, string> {
  const details: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'body';
    if (!details[path]) {
      details[path] = issue.message;
    }
  }

  return details;
}

export function toErrorResponse(error: ApiError, requestId: string) {
  return apiError(error.statusCode, error.code, error.message, requestId);
}

export function throwValidationError(
  details: Record<string, string>,
  message = 'Dados inválidos.',
): never {
  raiseApiError('VALIDATION_ERROR', message, details);
}

export function throwNotFound(
  message = 'Recurso não encontrado.',
  details?: Record<string, string>,
): never {
  raiseApiError('NOT_FOUND', message, details);
}

export function throwUnauthorized(
  message = 'Não autorizado.',
  details?: Record<string, string>,
): never {
  raiseApiError('UNAUTHORIZED', message, details);
}

export function throwForbidden(
  message = 'Acesso negado.',
  details?: Record<string, string>,
): never {
  raiseApiError('FORBIDDEN', message, details);
}

export function throwInsufficientStock(
  message = 'Estoque insuficiente.',
  details?: Record<string, string>,
): never {
  raiseApiError('INSUFFICIENT_STOCK', message, details);
}

export function throwInvalidOption(
  details: Record<string, string>,
  message = 'Opção do produto inválida.',
): never {
  raiseApiError('INVALID_OPTION', message, details);
}

export function throwInvalidQuery(
  message = 'Parâmetro de consulta inválido.',
  details?: Record<string, string>,
): never {
  raiseApiError('INVALID_QUERY', message, details);
}

export function throwInvalidCursor(
  message = 'Cursor inválido.',
  details?: Record<string, string>,
): never {
  raiseApiError('INVALID_CURSOR', message, details);
}

export function throwInvalidStatusTransition(
  message = 'Transição de status não permitida.',
  details?: Record<string, string>,
): never {
  raiseApiError('INVALID_STATUS_TRANSITION', message, details);
}

export function throwFromZod(error: ZodError, message = 'Dados inválidos.'): never {
  raiseApiError('VALIDATION_ERROR', message, zodErrorToDetails(error));
}

export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throwFromZod(error);
    }
    throw error;
  }
}
