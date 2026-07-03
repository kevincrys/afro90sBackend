import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { OrderRepository } from './order.repository';
import { ApiError } from '@afro90s/models';

const send = vi.fn();
const ORDER_ID = '550e8400-e29b-41d4-a716-446655440000';

const orderItem = {
  id: ORDER_ID,
  status: 'SOLICITADO',
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

describe('OrderRepository', () => {
  beforeEach(() => {
    send.mockReset();
  });

  const repository = new OrderRepository({ send } as never, 'test-orders');

  it('updateStatus rejects invalid transition', async () => {
    send.mockResolvedValueOnce({ Item: orderItem });
    await expect(repository.updateStatus(ORDER_ID, 'ENVIADO')).rejects.toThrow(ApiError);
  });

  it('list requires status filter', async () => {
    await expect(repository.list({ limit: 20 } as never)).rejects.toThrow(ApiError);
  });

  it('list queries gsi-status-createdAt', async () => {
    send.mockResolvedValueOnce({ Items: [] });
    await repository.list({ status: 'SOLICITADO', limit: 20 });
    const command = send.mock.calls[0][0] as QueryCommand;
    expect(command.input.IndexName).toBe('gsi-status-createdAt');
  });

  it('updateStatus applies valid transition', async () => {
    send.mockResolvedValueOnce({ Item: orderItem });
    send.mockResolvedValueOnce({ Attributes: { ...orderItem, status: 'EM_ATENDIMENTO' } });
    const updated = await repository.updateStatus(ORDER_ID, 'EM_ATENDIMENTO');
    expect(updated?.status).toBe('EM_ATENDIMENTO');
  });

  it('getById returns null when missing', async () => {
    send.mockResolvedValueOnce({});
    await expect(repository.getById(ORDER_ID)).resolves.toBeNull();
  });

  it('updateStatus sets expiresAt on terminal status', async () => {
    const shipped = { ...orderItem, status: 'ENVIADO' as const };
    send.mockResolvedValueOnce({ Item: shipped });
    send.mockResolvedValueOnce({
      Attributes: { ...shipped, status: 'CONCLUIDO', expiresAt: 1_700_000_000 },
    });
    const updated = await repository.updateStatus(ORDER_ID, 'CONCLUIDO');
    expect(updated?.status).toBe('CONCLUIDO');
  });

  it('updateStatus returns null when order is missing', async () => {
    send.mockResolvedValueOnce({});
    await expect(repository.updateStatus(ORDER_ID, 'EM_ATENDIMENTO')).resolves.toBeNull();
  });
});
