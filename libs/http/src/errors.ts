import { ZodError, z } from 'zod';
import { ApiError } from '@afro90s/models';
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
  return apiError(error.statusCode, error.code, error.message, requestId, error.details);
}

export function throwValidationError(
  details: Record<string, string>,
  message = 'Dados inválidos.',
): never {
  throw new ApiError('VALIDATION_ERROR', message, details);
}

export function throwNotFound(message = 'Recurso não encontrado.'): never {
  throw new ApiError('NOT_FOUND', message);
}

export function throwUnauthorized(message = 'Não autorizado.'): never {
  throw new ApiError('UNAUTHORIZED', message);
}

export function throwForbidden(message = 'Acesso negado.'): never {
  throw new ApiError('FORBIDDEN', message);
}

export function throwInsufficientStock(message = 'Estoque insuficiente.'): never {
  throw new ApiError('INSUFFICIENT_STOCK', message);
}

export function throwInvalidQuery(message = 'Parâmetro de consulta inválido.'): never {
  throw new ApiError('INVALID_QUERY', message);
}

export function throwInvalidCursor(message = 'Cursor inválido.'): never {
  throw new ApiError('INVALID_CURSOR', message);
}

export function throwInvalidStatusTransition(
  message = 'Transição de status não permitida.',
): never {
  throw new ApiError('INVALID_STATUS_TRANSITION', message);
}

export function throwFromZod(error: ZodError, message = 'Dados inválidos.'): never {
  throw new ApiError('VALIDATION_ERROR', message, zodErrorToDetails(error));
}

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throwFromZod(error);
    }
    throw error;
  }
}
