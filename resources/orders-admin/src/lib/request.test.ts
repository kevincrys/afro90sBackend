import { describe, expect, it } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  extractAdminOrderId,
  isAdminOrderById,
  isAdminOrderUpdate,
  isAdminOrdersCollection,
} from './request';

function event(
  method: string,
  rawPath: string,
  routeKey?: string,
): APIGatewayProxyEventV2 {
  return {
    rawPath,
    routeKey,
    requestContext: { http: { method } },
  } as APIGatewayProxyEventV2;
}

describe('admin order request helpers', () => {
  it('matches admin orders collection routes', () => {
    expect(isAdminOrdersCollection(event('GET', '/admin/orders', 'GET /admin/orders'))).toBe(true);
    expect(isAdminOrdersCollection(event('POST', '/admin/orders'))).toBe(false);
  });

  it('matches admin order by id routes', () => {
    expect(
      isAdminOrderById(event('GET', '/admin/orders/uuid', 'GET /admin/orders/{id}')),
    ).toBe(true);
    expect(isAdminOrderById(event('PUT', '/admin/orders/uuid'))).toBe(false);
  });

  it('matches order update route', () => {
    expect(
      isAdminOrderUpdate(event('PUT', '/admin/orders/uuid', 'PUT /admin/orders/{id}')),
    ).toBe(true);
    expect(isAdminOrderUpdate(event('PATCH', '/admin/orders/uuid'))).toBe(false);
    expect(isAdminOrderUpdate(event('PUT', '/admin/orders/uuid/status'))).toBe(false);
  });

  it('extracts order id from path', () => {
    expect(
      extractAdminOrderId({
        pathParameters: { id: '550e8400-e29b-41d4-a716-446655440000' },
        rawPath: '/admin/orders/x',
      } as APIGatewayProxyEventV2),
    ).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(
      extractAdminOrderId({
        rawPath: '/admin/orders/550e8400-e29b-41d4-a716-446655440000',
      } as APIGatewayProxyEventV2),
    ).toBe('550e8400-e29b-41d4-a716-446655440000');
  });
});
