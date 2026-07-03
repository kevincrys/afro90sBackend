import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { extractProductId, handleGetProductById } from './get-product-by-id';

const getById = vi.fn();

vi.mock('@afro90s/repositories', () => ({
  getProductRepository: () => ({ getById }),
  toPublicProduct: (product: { nameLower?: string; id: string; name: string }) => {
    const { nameLower, ...rest } = product;
    void nameLower;
    return rest;
  },
}));

const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';
const context = { requestId: 'req-1' } as Parameters<typeof handleGetProductById>[1];

const product = {
  id: PRODUCT_ID,
  name: 'Óculos',
  nameLower: 'oculos',
  description: '',
  price: 49.9,
  quantity: 1,
  photos: ['https://cdn.example.com/p.jpg'],
  category: 'oculos',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

function event(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
  return {
    rawPath: `/products/${PRODUCT_ID}`,
    pathParameters: { id: PRODUCT_ID },
    requestContext: { http: { method: 'GET' } },
    ...overrides,
  } as APIGatewayProxyEventV2;
}

describe('extractProductId', () => {
  it('reads from pathParameters', () => {
    expect(extractProductId(event())).toBe(PRODUCT_ID);
  });

  it('reads from rawPath when pathParameters is missing', () => {
    expect(
      extractProductId({
        rawPath: `/products/${PRODUCT_ID}`,
        pathParameters: undefined,
      } as APIGatewayProxyEventV2),
    ).toBe(PRODUCT_ID);
  });
});

describe('handleGetProductById', () => {
  beforeEach(() => {
    getById.mockReset();
  });

  it('returns product when found', async () => {
    getById.mockResolvedValueOnce(product);

    const result = await handleGetProductById(event(), context);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body as string);
    expect(body).toMatchObject({ id: PRODUCT_ID, name: 'Óculos' });
    expect(body).not.toHaveProperty('nameLower');
  });

  it('returns 404 when product is missing', async () => {
    getById.mockResolvedValueOnce(null);
    await expect(handleGetProductById(event(), context)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      statusCode: 404,
    });
  });

  it('returns 400 for malformed id', async () => {
    await expect(
      handleGetProductById(
        event({ pathParameters: { id: 'not-a-uuid' }, rawPath: '/products/not-a-uuid' }),
        context,
      ),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    });
  });
});
