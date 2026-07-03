import { describe, expect, it } from 'vitest';
import type { Product } from '@afro90s/models';
import {
  assertProductFound,
  buildOrderItem,
  buildValidatedOrderItems,
  centsToMoney,
  lineTotalCents,
  mergeOrderItems,
  priceToCents,
  validateSelectedOption,
  validateStock,
} from './order.validation';

const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';
const PRODUCT_ID_2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

const baseProduct: Product = {
  id: PRODUCT_ID,
  name: 'Óculos',
  nameLower: 'oculos',
  description: '',
  price: 89.9,
  quantity: 12,
  photos: ['https://cdn.example.com/p.jpg'],
  category: 'oculos',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('mergeOrderItems', () => {
  it('merges duplicate productId and selectedOption summing quantities', () => {
    const merged = mergeOrderItems([
      { productId: PRODUCT_ID, quantity: 1, selectedOption: 'Preto' },
      { productId: PRODUCT_ID, quantity: 2, selectedOption: 'Preto' },
      { productId: PRODUCT_ID, quantity: 1, selectedOption: 'Dourado' },
    ]);

    expect(merged).toEqual([
      { productId: PRODUCT_ID, quantity: 3, selectedOption: 'Preto' },
      { productId: PRODUCT_ID, quantity: 1, selectedOption: 'Dourado' },
    ]);
  });
});

describe('assertProductFound', () => {
  it('throws NOT_FOUND when product is null', () => {
    expect(() => assertProductFound(null, PRODUCT_ID)).toThrow(
      expect.objectContaining({ code: 'NOT_FOUND', statusCode: 404 }),
    );
  });
});

describe('validateSelectedOption', () => {
  it('requires selectedOption when product has options', () => {
    expect(() =>
      validateSelectedOption({ ...baseProduct, options: ['Preto'] }, { productId: PRODUCT_ID, quantity: 1 }),
    ).toThrow(expect.objectContaining({ code: 'INVALID_OPTION', statusCode: 400 }));
  });

  it('rejects invalid selectedOption', () => {
    expect(() =>
      validateSelectedOption(
        { ...baseProduct, options: ['Preto'] },
        { productId: PRODUCT_ID, quantity: 1, selectedOption: 'Azul' },
      ),
    ).toThrow(expect.objectContaining({ code: 'INVALID_OPTION', statusCode: 400 }));
  });

  it('rejects selectedOption when product has no options', () => {
    expect(() =>
      validateSelectedOption(baseProduct, {
        productId: PRODUCT_ID,
        quantity: 1,
        selectedOption: 'Preto',
      }),
    ).toThrow(expect.objectContaining({ code: 'INVALID_OPTION', statusCode: 400 }));
  });

  it('accepts item without selectedOption when product has no options', () => {
    expect(() =>
      validateSelectedOption(baseProduct, { productId: PRODUCT_ID, quantity: 1 }),
    ).not.toThrow();
  });
});

describe('buildOrderItem', () => {
  it('snapshots unitPrice from product', () => {
    expect(
      buildOrderItem(
        { ...baseProduct, options: ['Preto'] },
        { productId: PRODUCT_ID, quantity: 2, selectedOption: 'Preto' },
      ),
    ).toEqual({
      productId: PRODUCT_ID,
      quantity: 2,
      unitPrice: 89.9,
      selectedOption: 'Preto',
    });
  });
});

describe('money helpers', () => {
  it('converts BRL to centavos and back', () => {
    expect(priceToCents(89.9)).toBe(8990);
    expect(centsToMoney(8990)).toBe(89.9);
  });

  it('sums line totals in integer centavos', () => {
    expect(lineTotalCents(10.01, 3) + lineTotalCents(10.02, 2)).toBe(5007);
    expect(centsToMoney(lineTotalCents(10.01, 3) + lineTotalCents(10.02, 2))).toBe(50.07);
  });
});

describe('validateStock', () => {
  it('throws INSUFFICIENT_STOCK when quantity exceeds stock', () => {
    expect(() =>
      validateStock({ ...baseProduct, quantity: 0 }, { productId: PRODUCT_ID, quantity: 1 }),
    ).toThrow(expect.objectContaining({ code: 'INSUFFICIENT_STOCK', statusCode: 409 }));
  });
});

describe('buildValidatedOrderItems', () => {
  it('returns order items and fullPrice', async () => {
    const result = await buildValidatedOrderItems(
      [
        { productId: PRODUCT_ID, quantity: 2, selectedOption: 'Preto' },
        { productId: PRODUCT_ID, quantity: 1, selectedOption: 'Dourado' },
      ],
      async (id) => (id === PRODUCT_ID ? { ...baseProduct, options: ['Preto', 'Dourado'] } : null),
    );

    expect(result.fullPrice).toBe(269.7);
    expect(result.orderItems).toHaveLength(2);
  });

  it('sums fullPrice in centavos to avoid float drift', async () => {
    const result = await buildValidatedOrderItems(
      [
        { productId: PRODUCT_ID, quantity: 3 },
        { productId: PRODUCT_ID_2, quantity: 2 },
      ],
      async (id) => {
        if (id === PRODUCT_ID) {
          return { ...baseProduct, price: 10.01, quantity: 10 };
        }
        if (id === PRODUCT_ID_2) {
          return { ...baseProduct, id: PRODUCT_ID_2, price: 10.02, quantity: 10 };
        }
        return null;
      },
    );

    expect(result.fullPrice).toBe(50.07);
  });
});
