import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ApiError } from '@afro90s/models';
import { handleGetProducts } from './get-products';

const list = vi.fn();

vi.mock('@afro90s/repositories', () => ({
  getProductRepository: () => ({ list }),
  toPublicProduct: (product: { nameLower?: string; [key: string]: unknown }) => {
    const { nameLower, ...rest } = product;
    void nameLower;
    return rest;
  },
}));

const context = { requestId: 'req-1' } as Parameters<typeof handleGetProducts>[1];

function event(query: Record<string, string> = {}): APIGatewayProxyEventV2 {
  return {
    queryStringParameters: query,
    requestContext: { http: { method: 'GET' } },
  } as APIGatewayProxyEventV2;
}

describe('handleGetProducts', () => {
  beforeEach(() => {
    list.mockReset();
  });

  it('returns empty list', async () => {
    list.mockResolvedValueOnce({
      items: [],
      index: 'gsi-createdAt',
      filters: {},
    });

    const result = await handleGetProducts(event(), context);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body as string)).toEqual({
      items: [],
      hasMore: false,
    });
  });

  it('rejects invalid category', async () => {
    await expect(handleGetProducts(event({ category: 'invalid' }), context)).rejects.toThrow(
      ApiError,
    );
  });

  it('rejects name longer than 120 characters', async () => {
    await expect(handleGetProducts(event({ name: 'a'.repeat(121) }), context)).rejects.toMatchObject({
      code: 'INVALID_QUERY',
    });
    expect(list).not.toHaveBeenCalled();
  });
});
