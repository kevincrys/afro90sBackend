import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ApiError, OrderStatusEnum, type OrderStatus } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { buildPaginatedResponse, parseLimit } from '@afro90s/pagination';
import { getAdminOrderService } from '../services/order.service';

export async function handleGetAdminOrders(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const query = event.queryStringParameters ?? {};
  const limit = parseLimit(query.limit);

  let status: OrderStatus | undefined;
  if (query.status) {
    const parsed = OrderStatusEnum.safeParse(query.status);
    if (!parsed.success) {
      throw new ApiError('INVALID_QUERY', 'Status inválido.');
    }
    status = parsed.data;
  }

  const result = await getAdminOrderService().listOrders({
    status,
    cursor: query.cursor,
    limit,
  });

  const body = buildPaginatedResponse(result.items, result.lastEvaluatedKey, {
    index: result.index,
    filters: result.filters,
  });

  return ok(body, context.requestId);
}
