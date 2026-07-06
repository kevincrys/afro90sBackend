import { z } from 'zod';

export const OrderStatusEnum = z.enum([
  'SOLICITADO',
  'EM_ATENDIMENTO',
  'AGUARDANDO_PAGAMENTO',
  'EM_PREPARACAO',
  'ENVIADO',
  'CONCLUIDO',
  'CANCELADO',
]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set(['CONCLUIDO', 'CANCELADO']);

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  SOLICITADO: ['EM_ATENDIMENTO', 'CANCELADO'],
  EM_ATENDIMENTO: ['AGUARDANDO_PAGAMENTO', 'CANCELADO'],
  AGUARDANDO_PAGAMENTO: ['EM_PREPARACAO', 'CANCELADO'],
  EM_PREPARACAO: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['CONCLUIDO', 'CANCELADO'],
  CONCLUIDO: [],
  CANCELADO: [],
};

export function isValidOrderStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(2).max(120),
  quantity: z.number().int().min(1).max(99),
  unitPrice: z.number().positive().multipleOf(0.01),
  selectedOption: z.string().trim().min(1).max(40).optional(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const CreateOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  selectedOption: z.string().trim().min(1).max(40).optional(),
});
export type CreateOrderItemInput = z.infer<typeof CreateOrderItemSchema>;

export const CustomerSchema = z.object({
  name: z.string().min(2).max(200),
  address: z.string().min(2).max(200),
  postalCode: z.string().regex(/^\d{8}$/),
  tel: z.string().regex(/^\d{10,11}$/),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  status: OrderStatusEnum,
  items: z.array(OrderItemSchema).min(1).max(99),
  fullPrice: z.number().positive().multipleOf(0.01),
  customer: CustomerSchema,
  customerNameLower: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  expiresAt: z.number().int().positive().optional(),
});
export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderSchema = z.object({
  customer: CustomerSchema,
  items: z.array(CreateOrderItemSchema).min(1).max(99),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
});
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
