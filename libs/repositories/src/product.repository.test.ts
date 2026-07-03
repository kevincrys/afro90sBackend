import { describe, expect, it, vi, beforeEach } from 'vitest';
import { encodeCursor } from '@afro90s/pagination';
import { ProductRepository } from './product.repository';
import { ApiError } from '@afro90s/models';

const send = vi.fn();
const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';

const productItem = {
  id: PRODUCT_ID,
  name: 'Óculos',
  nameLower: 'oculos',
  description: '',
  price: 49.9,
  quantity: 5,
  photos: ['https://cdn.example.com/p.jpg'],
  category: 'oculos',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('ProductRepository', () => {
  beforeEach(() => {
    send.mockReset();
  });

  const repository = new ProductRepository({ send } as never, 'test-products');

  it('getById returns null when missing', async () => {
    send.mockResolvedValueOnce({});
    await expect(repository.getById('missing')).resolves.toBeNull();
  });

  it('getById returns parsed product', async () => {
    send.mockResolvedValueOnce({ Item: productItem });
    const product = await repository.getById(PRODUCT_ID);
    expect(product?.name).toBe('Óculos');
  });

  it('create persists product', async () => {
    send.mockResolvedValueOnce({});
    await repository.create(productItem);
    expect(send).toHaveBeenCalledOnce();
  });

  it('list scans table with begins_with when name filter is present', async () => {
    send.mockResolvedValueOnce({ Items: [] });
    const result = await repository.list({ name: 'Óculos', limit: 20 });
    const input = send.mock.calls[0][0].input;
    expect(input.IndexName).toBeUndefined();
    expect(input.FilterExpression).toBe('begins_with(#nameLower, :prefix)');
    expect(input.ExpressionAttributeValues).toMatchObject({ ':prefix': 'oculos' });
    expect(result.index).toBe('primary');
  });

  it('list applies category filter together with name', async () => {
    send.mockResolvedValueOnce({ Items: [] });
    await repository.list({ name: 'Óculos', category: 'oculos', limit: 20 });
    const input = send.mock.calls[0][0].input;
    expect(input.FilterExpression).toBe(
      'begins_with(#nameLower, :prefix) AND #category = :category',
    );
  });

  it('list scans gsi-createdAt without name filter', async () => {
    send.mockResolvedValueOnce({ Items: [] });
    await repository.list({ limit: 20 });
    expect(send.mock.calls[0][0].input.IndexName).toBe('gsi-createdAt');
  });

  it('list applies category filter', async () => {
    send.mockResolvedValueOnce({ Items: [] });
    await repository.list({ category: 'oculos', limit: 20 });
    expect(send.mock.calls[0][0].input.FilterExpression).toBe('category = :category');
  });

  it('delete removes product', async () => {
    send.mockResolvedValueOnce({});
    await repository.delete(PRODUCT_ID);
    expect(send).toHaveBeenCalledOnce();
  });

  it('rejects cursor with mismatched index', async () => {
    const cursor = encodeCursor({
      v: 1,
      index: 'gsi-createdAt',
      key: { createdAt: '2025-01-01T00:00:00.000Z' },
      filters: { name: 'oculos' },
    });
    await expect(repository.list({ name: 'oculos', cursor, limit: 20 })).rejects.toThrow(ApiError);
  });

  it('rejects legacy gsi-name cursor after index removal', async () => {
    const cursor = Buffer.from(
      JSON.stringify({
        v: 1,
        index: 'gsi-name',
        key: { nameLower: 'oculos', id: PRODUCT_ID },
        filters: { name: 'oculos' },
      }),
      'utf8',
    ).toString('base64url');
    await expect(repository.list({ name: 'oculos', cursor, limit: 20 })).rejects.toThrow(ApiError);
  });

  it('updateStock throws when stock goes negative', async () => {
    const error = new Error('Conditional check failed');
    error.name = 'ConditionalCheckFailedException';
    send.mockRejectedValueOnce(error);
    await expect(repository.updateStock(PRODUCT_ID, -10)).rejects.toThrow(ApiError);
  });
});
