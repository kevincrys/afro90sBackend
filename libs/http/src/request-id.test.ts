import { describe, expect, it } from 'vitest';
import { resolveRequestId } from './request-id';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

function minimalEvent(headers: Record<string, string> = {}): APIGatewayProxyEventV2 {
  return {
    headers,
    requestContext: { http: { method: 'GET' } },
  } as APIGatewayProxyEventV2;
}

describe('resolveRequestId', () => {
  it('uses x-request-id header when present', () => {
    const event = minimalEvent({ 'x-request-id': 'req-from-client' });
    expect(resolveRequestId(event)).toBe('req-from-client');
  });

  it('uses X-Request-Id header when present', () => {
    const event = minimalEvent({ 'X-Request-Id': 'req-alt-case' });
    expect(resolveRequestId(event)).toBe('req-alt-case');
  });

  it('generates UUID when header is missing', () => {
    const id = resolveRequestId(minimalEvent());
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
