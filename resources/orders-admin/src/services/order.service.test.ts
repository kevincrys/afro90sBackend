import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@afro90s/models';
import { AdminOrderService } from './order.service';

const list = vi.fn();
const getById = vi.fn();
const updateStatus = vi.fn();

const ORDER_ID = '550e8400-e29b-41d4-a716-446655440000';

const order = {
  id: ORDER_ID,
  status: 'SOLICITADO' as const,
  items: [{ productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 1, unitPrice: 10 }],
  fullPrice: 10,
  customer: {
    name: 'Maria',
    address: 'Rua A',
    postalCode: '01310100',
    tel: '11999999999',
  },
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('AdminOrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const service = () =>
    new AdminOrderService({ list, getById, updateStatus } as never);

  it('lists orders via repository', async () => {
    list.mockResolvedValueOnce({ items: [order], index: 'primary', filters: {} });
    const result = await service().listOrders({ limit: 20 });
    expect(result.items).toHaveLength(1);
    expect(list).toHaveBeenCalledWith({ limit: 20 });
  });

  it('returns order when found', async () => {
    getById.mockResolvedValueOnce(order);
    await expect(service().getOrder(ORDER_ID)).resolves.toEqual(order);
  });

  it('throws when order is missing', async () => {
    getById.mockResolvedValueOnce(null);
    await expect(service().getOrder(ORDER_ID)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<ApiError>);
  });

  it('updates order status', async () => {
    updateStatus.mockResolvedValueOnce({ ...order, status: 'EM_ATENDIMENTO' });
    const result = await service().updateOrderStatus(ORDER_ID, 'EM_ATENDIMENTO');
    expect(result.status).toBe('EM_ATENDIMENTO');
  });

  it('throws when update target is missing', async () => {
    updateStatus.mockResolvedValueOnce(null);
    await expect(service().updateOrderStatus(ORDER_ID, 'EM_ATENDIMENTO')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
