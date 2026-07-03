import { describe, expect, it } from 'vitest';
import { CreateProductSchema, UpdateProductSchema } from './product';

const validProduct = {
  name: 'Óculos Vintage',
  price: 49.9,
  photos: ['https://cdn.example.com/photo.jpg'],
  category: 'oculos' as const,
};

describe('CreateProductSchema', () => {
  it('accepts valid input with defaults', () => {
    const result = CreateProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
      expect(result.data.quantity).toBe(0);
    }
  });

  it('rejects duplicate options (case-insensitive)', () => {
    const result = CreateProductSchema.safeParse({
      ...validProduct,
      options: ['Preto', 'preto'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = CreateProductSchema.safeParse({
      ...validProduct,
      name: 'A',
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 options', () => {
    const result = CreateProductSchema.safeParse({
      ...validProduct,
      options: ['a', 'b', 'c', 'd', 'e', 'f'],
    });
    expect(result.success).toBe(false);
  });
});

describe('UpdateProductSchema', () => {
  it('accepts partial updates', () => {
    const result = UpdateProductSchema.safeParse({ quantity: 10 });
    expect(result.success).toBe(true);
  });

  it('rejects duplicate options on partial update', () => {
    const result = UpdateProductSchema.safeParse({
      options: ['Azul', 'azul'],
    });
    expect(result.success).toBe(false);
  });
});
