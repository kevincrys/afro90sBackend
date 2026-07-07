import { describe, expect, it } from 'vitest';
import { CreateOrderSchema, isTerminalOrderStatus, isValidOrderStatusTransition } from './order';

const validOrder = {
  customer: {
    name: 'Maria Silva',
    address: 'Rua das Flores 123',
    postalCode: '01310100',
    tel: '11999998888',
  },
  items: [
    {
      productId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 2,
    },
  ],
};

describe('CreateOrderSchema', () => {
  it('accepts valid order input', () => {
    const result = CreateOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it('rejects invalid postal code', () => {
    const result = CreateOrderSchema.safeParse({
      ...validOrder,
      customer: { ...validOrder.customer, postalCode: '01310-100' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects customer name with digits', () => {
    const result = CreateOrderSchema.safeParse({
      ...validOrder,
      customer: { ...validOrder.customer, name: 'Maria123' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts customer name with accents and apostrophe', () => {
    const result = CreateOrderSchema.safeParse({
      ...validOrder,
      customer: { ...validOrder.customer, name: "José D'Avila" },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone', () => {
    const result = CreateOrderSchema.safeParse({
      ...validOrder,
      customer: { ...validOrder.customer, tel: '123' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 99 items', () => {
    const result = CreateOrderSchema.safeParse({
      ...validOrder,
      items: Array.from({ length: 100 }, () => validOrder.items[0]),
    });
    expect(result.success).toBe(false);
  });

  it('rejects quantity above 99 per item', () => {
    const result = CreateOrderSchema.safeParse({
      ...validOrder,
      items: [{ ...validOrder.items[0], quantity: 100 }],
    });
    expect(result.success).toBe(false);
  });
});

describe('isValidOrderStatusTransition', () => {
  it('allows forward workflow transitions', () => {
    expect(isValidOrderStatusTransition('SOLICITADO', 'EM_ATENDIMENTO')).toBe(true);
    expect(isValidOrderStatusTransition('ENVIADO', 'CONCLUIDO')).toBe(true);
  });

  it('allows cancel from any non-terminal status', () => {
    expect(isValidOrderStatusTransition('EM_PREPARACAO', 'CANCELADO')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isValidOrderStatusTransition('SOLICITADO', 'ENVIADO')).toBe(false);
    expect(isValidOrderStatusTransition('CONCLUIDO', 'CANCELADO')).toBe(false);
  });

  it('identifies terminal statuses', () => {
    expect(isTerminalOrderStatus('CONCLUIDO')).toBe(true);
    expect(isTerminalOrderStatus('SOLICITADO')).toBe(false);
  });
});
