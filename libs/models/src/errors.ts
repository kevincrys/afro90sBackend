export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_OPTION'
  | 'INVALID_IMAGE'
  | 'PAYLOAD_TOO_LARGE'
  | 'NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_CURSOR'
  | 'INVALID_QUERY'
  | 'INVALID_STATUS_TRANSITION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string>;
  requestId?: string;
}

export const API_ERROR_STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  INVALID_OPTION: 400,
  INVALID_IMAGE: 400,
  INVALID_CURSOR: 400,
  INVALID_QUERY: 400,
  PAYLOAD_TOO_LARGE: 413,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INSUFFICIENT_STOCK: 409,
  INVALID_STATUS_TRANSITION: 409,
  INTERNAL_ERROR: 500,
};

export function statusForApiErrorCode(code: ApiErrorCode): number {
  return API_ERROR_STATUS[code];
}

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, string>;

  constructor(code: ApiErrorCode, message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusForApiErrorCode(code);
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
