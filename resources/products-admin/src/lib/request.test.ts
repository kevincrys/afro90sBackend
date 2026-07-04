import { describe, expect, it } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  extractAdminProductId,
  isAdminProductById,
  isAdminProductStock,
  isAdminProductsCollection,
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

describe('admin request helpers', () => {
  it('matches admin products collection routes', () => {
    expect(isAdminProductsCollection(event('GET', '/admin/products', 'GET /admin/products'))).toBe(
      true,
    );
    expect(isAdminProductsCollection(event('POST', '/admin/products'))).toBe(true);
    expect(isAdminProductsCollection(event('DELETE', '/admin/products'))).toBe(false);
  });

  it('matches admin product by id routes', () => {
    expect(
      isAdminProductById(
        event('GET', '/admin/products/uuid', 'GET /admin/products/{id}'),
      ),
    ).toBe(true);
    expect(isAdminProductById(event('PUT', '/admin/products/uuid'))).toBe(true);
    expect(isAdminProductById(event('PATCH', '/admin/products/uuid'))).toBe(false);
  });

  it('matches stock route', () => {
    expect(
      isAdminProductStock(
        event('PUT', '/admin/products/uuid/stock', 'PUT /admin/products/{id}/stock'),
      ),
    ).toBe(true);
    expect(isAdminProductStock(event('PATCH', '/admin/products/uuid/stock'))).toBe(false);
  });

  it('extracts product id from path', () => {
    expect(
      extractAdminProductId({
        pathParameters: { id: '550e8400-e29b-41d4-a716-446655440000' },
        rawPath: '/admin/products/x',
      } as APIGatewayProxyEventV2),
    ).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(
      extractAdminProductId({
        rawPath: '/admin/products/550e8400-e29b-41d4-a716-446655440000/stock',
      } as APIGatewayProxyEventV2),
    ).toBe('550e8400-e29b-41d4-a716-446655440000');
  });
});
