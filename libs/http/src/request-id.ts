import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { randomUUID } from 'node:crypto';

const REQUEST_ID_HEADER = 'x-request-id';

export function resolveRequestId(event: APIGatewayProxyEventV2): string {
  const fromHeader = event.headers?.[REQUEST_ID_HEADER] ?? event.headers?.['X-Request-Id'];
  if (fromHeader?.trim()) {
    return fromHeader.trim();
  }
  return randomUUID();
}
