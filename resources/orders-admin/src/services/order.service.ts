import { ApiError, type Order, type OrderStatus } from '@afro90s/models';
import {
  getOrderRepository,
  type ListOrdersParams,
  type ListOrdersResult,
  type OrderRepository,
} from '@afro90s/repositories';

export class AdminOrderService {
  constructor(private readonly repository: OrderRepository = getOrderRepository()) {}

  listOrders(params: ListOrdersParams): Promise<ListOrdersResult> {
    return this.repository.list(params);
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.repository.getById(id);
    if (!order) {
      throw new ApiError('NOT_FOUND', 'Pedido não encontrado.');
    }
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const updated = await this.repository.updateStatus(id, status);
    if (!updated) {
      throw new ApiError('NOT_FOUND', 'Pedido não encontrado.');
    }
    return updated;
  }
}

let defaultService: AdminOrderService | undefined;

export function getAdminOrderService(): AdminOrderService {
  if (!defaultService) {
    defaultService = new AdminOrderService();
  }
  return defaultService;
}

/** @internal test helper */
export function resetAdminOrderServiceForTests(): void {
  defaultService = undefined;
}
