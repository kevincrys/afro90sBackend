import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ApiError } from '@afro90s/models';
import { handler } from './handler';

const list = vi.fn();
const getById = vi.fn();
const createProduct = vi.fn();
const updateProduct = vi.fn();
const deleteProduct = vi.fn();
const updateStock = vi.fn();

vi.mock('@afro90s/repositories', () => ({
  getProductRepository: () => ({ list, getById }),
  toPublicProduct: (product: Record<string, unknown>) => {
    const { nameLower, ...rest } = product;
    void nameLower;
    return rest;
  },
}));

vi.mock('./services/product.service', () => ({
  getAdminProductService: () => ({
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
  }),
}));

const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';

const product = {
  id: PRODUCT_ID,
  name: 'Óculos',
  nameLower: 'oculos',
  description: 'Desc',
  price: 49.9,
  quantity: 5,
  photos: ['https://cdn.example.com/products/x.jpg'],
  category: 'oculos',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

function adminEvent(
  overrides: Partial<APIGatewayProxyEventV2> = {},
  claims: Record<string, unknown> = { sub: 'admin-uuid', 'cognito:groups': 'admins' },
): APIGatewayProxyEventV2 {
  return {
    rawPath: '/admin/products',
    headers: { authorization: 'Bearer test-token' },
    queryStringParameters: {},
    requestContext: {
      http: { method: 'GET' },
      authorizer: { jwt: { claims } },
    },
    ...overrides,
  } as APIGatewayProxyEventV2;
}

describe('products-admin handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PRODUCTS_TABLE = 'test-products';
  });

  it('returns 401 when jwt claims are missing', async () => {
    const result = await handler(
      adminEvent({ requestContext: { http: { method: 'GET' } } } as APIGatewayProxyEventV2),
      {} as Context,
    );
    expect(result.statusCode).toBe(401);
  });

  it('routes GET /admin/products', async () => {
    list.mockResolvedValueOnce({ items: [product], index: 'gsi-createdAt', filters: {} });
    const result = await handler(adminEvent(), {} as Context);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body as string)).toMatchObject({ items: [{ id: PRODUCT_ID }] });
  });

  it('routes GET /admin/products with q filter', async () => {
    list.mockResolvedValueOnce({ items: [product], index: 'primary', filters: { q: 'oculos' } });
    const result = await handler(
      adminEvent({ queryStringParameters: { q: 'oculos' } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(200);
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ q: 'oculos', name: undefined }));
  });

  it('returns 400 when q is too short', async () => {
    const result = await handler(
      adminEvent({ queryStringParameters: { q: 'a' } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body as string).code).toBe('INVALID_QUERY');
    expect(list).not.toHaveBeenCalled();
  });

  it('returns 400 when q exceeds 120 characters', async () => {
    const result = await handler(
      adminEvent({ queryStringParameters: { q: 'a'.repeat(121) } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body as string).code).toBe('INVALID_QUERY');
    expect(list).not.toHaveBeenCalled();
  });

  it('routes GET /admin/products/{id}', async () => {
    getById.mockResolvedValueOnce(product);
    const result = await handler(
      adminEvent({
        rawPath: `/admin/products/${PRODUCT_ID}`,
        pathParameters: { id: PRODUCT_ID },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body as string)).toMatchObject({ id: PRODUCT_ID });
  });

  it('returns 404 when product is missing', async () => {
    getById.mockResolvedValueOnce(null);
    const result = await handler(
      adminEvent({
        rawPath: `/admin/products/${PRODUCT_ID}`,
        pathParameters: { id: PRODUCT_ID },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(404);
  });

  it('routes POST /admin/products with JSON body', async () => {
    createProduct.mockResolvedValueOnce(product);
    const result = await handler(
      adminEvent({
        requestContext: {
          http: { method: 'POST' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Óculos',
          price: 49.9,
          quantity: 5,
          category: 'oculos',
        }),
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(201);
    expect(createProduct).toHaveBeenCalledOnce();
  });

  it('returns 400 for invalid POST body', async () => {
    const result = await handler(
      adminEvent({
        requestContext: {
          http: { method: 'POST' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'X' }),
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('routes PUT /admin/products/{id}', async () => {
    updateProduct.mockResolvedValueOnce({ ...product, name: 'Novo' });
    const result = await handler(
      adminEvent({
        rawPath: `/admin/products/${PRODUCT_ID}`,
        pathParameters: { id: PRODUCT_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Novo' }),
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(200);
  });

  it('routes DELETE /admin/products/{id}', async () => {
    deleteProduct.mockResolvedValueOnce(undefined);
    const result = await handler(
      adminEvent({
        rawPath: `/admin/products/${PRODUCT_ID}`,
        pathParameters: { id: PRODUCT_ID },
        requestContext: {
          http: { method: 'DELETE' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(204);
  });

  it('routes PUT /admin/products/{id}/stock', async () => {
    updateStock.mockResolvedValueOnce({ id: PRODUCT_ID, quantity: 3 });
    const result = await handler(
      adminEvent({
        rawPath: `/admin/products/${PRODUCT_ID}/stock`,
        pathParameters: { id: PRODUCT_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: JSON.stringify({ delta: -2 }),
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body as string)).toEqual({ id: PRODUCT_ID, quantity: 3 });
  });

  it('returns 400 for invalid product id', async () => {
    const result = await handler(
      adminEvent({
        rawPath: '/admin/products/not-a-uuid',
        pathParameters: { id: 'not-a-uuid' },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 for invalid category filter', async () => {
    const result = await handler(
      adminEvent({ queryStringParameters: { category: 'invalid' } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 404 when delete target is missing', async () => {
    deleteProduct.mockRejectedValueOnce(new ApiError('NOT_FOUND', 'Produto não encontrado.'));
    const result = await handler(
      adminEvent({
        rawPath: `/admin/products/${PRODUCT_ID}`,
        pathParameters: { id: PRODUCT_ID },
        requestContext: {
          http: { method: 'DELETE' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(404);
  });

  it('returns 400 for invalid PUT stock body', async () => {
    const result = await handler(
      adminEvent({
        rawPath: `/admin/products/${PRODUCT_ID}/stock`,
        pathParameters: { id: PRODUCT_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: JSON.stringify({ delta: 0 }),
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 when PUT stock has no body', async () => {
    const result = await handler(
      adminEvent({
        rawPath: `/admin/products/${PRODUCT_ID}/stock`,
        pathParameters: { id: PRODUCT_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 when PUT stock body is invalid JSON', async () => {
    const result = await handler(
      adminEvent({
        rawPath: `/admin/products/${PRODUCT_ID}/stock`,
        pathParameters: { id: PRODUCT_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: 'not-json',
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 404 for unknown routes', async () => {
    const result = await handler(
      adminEvent({
        rawPath: '/admin/unknown',
        requestContext: {
          http: { method: 'GET' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(404);
  });

  it('responds to OPTIONS with 204 without auth', async () => {
    const result = await handler(
      adminEvent({ requestContext: { http: { method: 'OPTIONS' } } } as APIGatewayProxyEventV2),
      {} as Context,
    );
    expect(result.statusCode).toBe(204);
  });
});
