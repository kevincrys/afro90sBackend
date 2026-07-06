import { describe, expect, it } from 'vitest';
import { toPublicOrder } from './order.mapper';

describe('toPublicOrder', () => {
  it('omits customerNameLower from API response', () => {
    const order = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'SOLICITADO' as const,
      items: [{ productId: '550e8400-e29b-41d4-a716-446655440001', productName: 'Produto teste', quantity: 1, unitPrice: 10 }],
      fullPrice: 10,
      customer: {
        name: 'Maria',
        address: 'Rua A',
        postalCode: '01310100',
        tel: '11999999999',
      },
      customerNameLower: 'maria',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    expect(toPublicOrder(order)).not.toHaveProperty('customerNameLower');
    expect(toPublicOrder(order).customer.name).toBe('Maria');
  });
});
