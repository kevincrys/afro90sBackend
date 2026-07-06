import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createOrder } from './order.service';

const getById = vi.fn();
const create = vi.fn();

vi.mock('@afro90s/repositories', () => ({
  getProductRepository: () => ({ getById }),
  getOrderRepository: () => ({ create }),
}));

vi.mock('./email.service', () => ({
  sendOrderNotification: vi.fn().mockResolvedValue(undefined),
}));

const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';
const PRODUCT_ID_2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

const customer = {
  name: 'Maria Silva',
  address: 'Rua das Flores 123',
  postalCode: '01310100',
  tel: '11999998888',
};

const baseProduct = {
  id: PRODUCT_ID,
  name: 'Óculos',
  nameLower: 'oculos',
  description: '',
  price: 89.9,
  quantity: 12,
  photos: ['https://cdn.example.com/p.jpg'],
  category: 'oculos' as const,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('createOrder', () => {
  beforeEach(() => {
    getById.mockReset();
    create.mockReset();
    process.env.ORDERS_TABLE = 'test-orders';
    process.env.PRODUCTS_TABLE = 'test-products';
  });

  it('creates order with calculated fullPrice', async () => {
    getById
      .mockResolvedValueOnce({ ...baseProduct, options: ['Preto'] })
      .mockResolvedValueOnce({ ...baseProduct, id: PRODUCT_ID_2, price: 10, quantity: 5 });

    const result = await createOrder({
      customer,
      items: [
        { productId: PRODUCT_ID, quantity: 2, selectedOption: 'Preto' },
        { productId: PRODUCT_ID_2, quantity: 1 },
      ],
    });

    expect(result.status).toBe('SOLICITADO');
    expect(result.fullPrice).toBe(189.8);
    expect(create).toHaveBeenCalledOnce();
    const savedOrder = create.mock.calls[0][0];
    expect(savedOrder.items).toEqual([
      {
        productId: PRODUCT_ID,
        productName: 'Óculos',
        quantity: 2,
        unitPrice: 89.9,
        selectedOption: 'Preto',
      },
      { productId: PRODUCT_ID_2, productName: 'Óculos', quantity: 1, unitPrice: 10 },
    ]);
  });

  it('merges items before validating stock and price', async () => {
    getById.mockResolvedValueOnce({ ...baseProduct, quantity: 3 });

    await createOrder({
      customer,
      items: [
        { productId: PRODUCT_ID, quantity: 1 },
        { productId: PRODUCT_ID, quantity: 2 },
      ],
    });

    expect(getById).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0].items[0].quantity).toBe(3);
    expect(create.mock.calls[0][0].fullPrice).toBe(269.7);
  });

  it('persists customerNameLower on create', async () => {
    getById.mockResolvedValueOnce({ ...baseProduct });

    await createOrder({
      customer,
      items: [{ productId: PRODUCT_ID, quantity: 1 }],
    });

    expect(create.mock.calls[0][0].customerNameLower).toBe('maria silva');
  });

  it('throws NOT_FOUND when product is missing', async () => {
    getById.mockResolvedValueOnce(null);

    await expect(
      createOrder({
        customer,
        items: [{ productId: PRODUCT_ID, quantity: 1 }],
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', statusCode: 404 });
  });

  it('throws INSUFFICIENT_STOCK when quantity exceeds stock', async () => {
    getById.mockResolvedValueOnce({ ...baseProduct, quantity: 0 });

    await expect(
      createOrder({
        customer,
        items: [{ productId: PRODUCT_ID, quantity: 1 }],
      }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK', statusCode: 409 });
  });

  it('throws INVALID_OPTION when product has options but selectedOption is missing', async () => {
    getById.mockResolvedValueOnce({ ...baseProduct, options: ['Preto'] });

    await expect(
      createOrder({
        customer,
        items: [{ productId: PRODUCT_ID, quantity: 1 }],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_OPTION', statusCode: 400 });
  });

  it('throws INVALID_OPTION when product has no options but selectedOption is sent', async () => {
    getById.mockResolvedValueOnce({ ...baseProduct });

    await expect(
      createOrder({
        customer,
        items: [{ productId: PRODUCT_ID, quantity: 1, selectedOption: 'Preto' }],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_OPTION', statusCode: 400 });
  });

  it('throws INVALID_OPTION when option is invalid', async () => {
    getById.mockResolvedValueOnce({ ...baseProduct, options: ['Preto'] });

    await expect(
      createOrder({
        customer,
        items: [{ productId: PRODUCT_ID, quantity: 1, selectedOption: 'Azul' }],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_OPTION', statusCode: 400 });
  });
});
