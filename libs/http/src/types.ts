export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_CURSOR'
  | 'INVALID_STATUS_TRANSITION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  code: ApiErrorCode | string;
  message: string;
  details?: Record<string, string>;
  requestId?: string;
}
