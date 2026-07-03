import { describe, expect, it } from 'vitest';
import type { Product } from '@afro90s/models';
import { toPublicProduct } from './product.mapper';

const product = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Óculos',
  nameLower: 'oculos',
  description: '',
  price: 49.9,
  quantity: 1,
  photos: [],
  category: 'oculos',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
} satisfies Product;

describe('toPublicProduct', () => {
  it('omits nameLower from API response', () => {
    expect(toPublicProduct(product)).toEqual({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      photos: product.photos,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  });
});
