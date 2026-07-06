import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GetCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { OrderRepository } from './order.repository';
import { ApiError } from '@afro90s/models';

const send = vi.fn();
const ORDER_ID = '550e8400-e29b-41d4-a716-446655440000';

const orderItem = {
  id: ORDER_ID,
  status: 'SOLICITADO',
  items: [{ productId: '550e8400-e29b-41d4-a716-446655440001', productName: 'Produto teste', quantity: 1, unitPrice: 10 }],
  fullPrice: 10,
  customer: {
    name: 'Maria Silva',
    address: 'Rua A',
    postalCode: '01310100',
    tel: '11999999999',
  },
  customerNameLower: 'maria silva',
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

  it('list without status scans table', async () => {
    send.mockResolvedValueOnce({ Items: [orderItem] });
    const result = await repository.list({ limit: 20 });
    const command = send.mock.calls[0][0] as ScanCommand;
    expect(command.input.TableName).toBe('test-orders');
    expect(result.index).toBe('primary');
    expect(result.items).toHaveLength(1);
  });

  it('list queries gsi-status-createdAt when status filter is set', async () => {
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

  it('rejects cursor with mismatched index', async () => {
    const { encodeCursor } = await import('@afro90s/pagination');
    const cursor = encodeCursor({
      v: 1,
      index: 'primary',
      key: { id: ORDER_ID },
      filters: { status: 'SOLICITADO' },
    });
    await expect(
      repository.list({ status: 'SOLICITADO', cursor, limit: 20 }),
    ).rejects.toThrow(ApiError);
  });

  it('list by full UUID uses GetItem', async () => {
    send.mockResolvedValueOnce({ Item: orderItem });
    const result = await repository.list({ q: ORDER_ID, limit: 20 });
    expect(send.mock.calls[0][0]).toBeInstanceOf(GetCommand);
    expect(result.items).toHaveLength(1);
    expect(result.filters).toEqual({ q: ORDER_ID });
  });

  it('list by full UUID returns empty when status mismatches', async () => {
    send.mockResolvedValueOnce({ Item: orderItem });
    const result = await repository.list({ q: ORDER_ID, status: 'ENVIADO', limit: 20 });
    expect(result.items).toHaveLength(0);
  });

  it('list by id prefix scans with begins_with on id', async () => {
    send.mockResolvedValueOnce({ Items: [orderItem] });
    await repository.list({ q: '550e8400', limit: 20 });
    const command = send.mock.calls[0][0] as ScanCommand;
    expect(command.input.FilterExpression).toBe('begins_with(#id, :q)');
  });

  it('list by customer name scans with begins_with on customerNameLower', async () => {
    send.mockResolvedValueOnce({ Items: [orderItem] });
    await repository.list({ q: 'maria', limit: 20 });
    const command = send.mock.calls[0][0] as ScanCommand;
    expect(command.input.FilterExpression).toBe('begins_with(#customerNameLower, :prefix)');
    expect(command.input.ExpressionAttributeValues?.[':prefix']).toBe('maria');
  });

  it('list by customer name with status queries gsi with filter', async () => {
    send.mockResolvedValueOnce({ Items: [orderItem] });
    await repository.list({ q: 'maria', status: 'SOLICITADO', limit: 20 });
    const command = send.mock.calls[0][0] as QueryCommand;
    expect(command.input.IndexName).toBe('gsi-status-createdAt');
    expect(command.input.FilterExpression).toBe('begins_with(#customerNameLower, :prefix)');
  });
});
