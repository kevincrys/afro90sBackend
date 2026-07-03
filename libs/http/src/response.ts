import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import type { ApiErrorBody } from './types';

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

export function baseHeaders(requestId: string): Record<string, string> {
  return {
    'Content-Type': JSON_CONTENT_TYPE,
    'X-Request-Id': requestId,
  };
}

export function ok(body: unknown, requestId: string): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 200,
    headers: baseHeaders(requestId),
    body: JSON.stringify(body),
  };
}

export function created(body: unknown, requestId: string): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 201,
    headers: baseHeaders(requestId),
    body: JSON.stringify(body),
  };
}

export function noContent(requestId: string): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 204,
    headers: baseHeaders(requestId),
    body: '',
  };
}

export function apiError(
  statusCode: number,
  code: string,
  message: string,
  requestId: string,
  details?: Record<string, string>,
): APIGatewayProxyStructuredResultV2 {
  const payload: ApiErrorBody = {
    code,
    message,
    requestId,
    ...(details ? { details } : {}),
  };

  return {
    statusCode,
    headers: baseHeaders(requestId),
    body: JSON.stringify(payload),
  };
}

export function internalError(requestId: string): APIGatewayProxyStructuredResultV2 {
  return apiError(500, 'INTERNAL_ERROR', 'Erro interno do servidor.', requestId);
}
