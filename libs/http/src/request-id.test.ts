import { describe, expect, it } from 'vitest';
import { requestLogContext, resolveRequestId } from './request-id';
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

describe('requestLogContext', () => {
  it('returns path and method without sensitive headers', () => {
    expect(
      requestLogContext({
        rawPath: '/admin/products',
        routeKey: 'GET /admin/products',
        headers: { authorization: 'Bearer secret' },
        requestContext: { http: { method: 'GET' } },
      } as APIGatewayProxyEventV2),
    ).toEqual({
      path: '/admin/products',
      method: 'GET',
      routeKey: 'GET /admin/products',
    });
  });

  it('omits routeKey when absent', () => {
    expect(
      requestLogContext({
        rawPath: '/products',
        requestContext: { http: { method: 'POST' } },
      } as APIGatewayProxyEventV2),
    ).toEqual({ path: '/products', method: 'POST' });
  });

  it('defaults path and method when missing', () => {
    expect(
      requestLogContext({
        requestContext: { http: { method: undefined as unknown as string } },
      } as APIGatewayProxyEventV2),
    ).toEqual({ path: '', method: '' });
  });
});
