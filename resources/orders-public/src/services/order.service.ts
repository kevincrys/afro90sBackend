import { randomUUID } from 'node:crypto';
import type { CreateOrderInput, Order } from '@afro90s/models';
import { normalizeNameLower } from '@afro90s/models';
import { getOrderRepository, getProductRepository } from '@afro90s/repositories';
import { sendOrderNotification } from './email.service';
import { buildValidatedOrderItems, mergeOrderItems } from './order.validation';

export interface CreateOrderResult {
  id: string;
  status: Order['status'];
  fullPrice: number;
}

export { mergeOrderItems } from './order.validation';

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { orderItems, fullPrice } = await buildValidatedOrderItems(
    mergeOrderItems(input.items),
    (productId) => getProductRepository().getById(productId),
  );

  const now = new Date().toISOString();
  const order: Order = {
    id: randomUUID(),
    status: 'SOLICITADO',
    items: orderItems,
    fullPrice,
    customer: input.customer,
    customerNameLower: normalizeNameLower(input.customer.name),
    createdAt: now,
    updatedAt: now,
  };

  await getOrderRepository().create(order);
  await sendOrderNotification(order);

  return {
    id: order.id,
    status: order.status,
    fullPrice: order.fullPrice,
  };
}
