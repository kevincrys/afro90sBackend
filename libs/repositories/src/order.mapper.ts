import type { Order } from '@afro90s/models';

export type PublicOrder = Omit<Order, 'customerNameLower'>;

export function toPublicOrder(order: Order): PublicOrder {
  const { customerNameLower, ...publicFields } = order;
  void customerNameLower;
  return publicFields;
}
