import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { raiseApiError, OrderStatusEnum, type OrderStatus } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { buildPaginatedResponse, parseLimit } from '@afro90s/pagination';
import { toPublicOrder } from '@afro90s/repositories';
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
      raiseApiError('INVALID_QUERY', 'Status inválido.', {
        param: 'status',
        value: query.status ?? '',
      });
    }
    status = parsed.data;
  }

  let q: string | undefined;
  if (query.q !== undefined) {
    const trimmed = query.q.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      raiseApiError('INVALID_QUERY', 'Busca deve ter ao menos 2 caracteres.', {
        param: 'q',
        value: query.q,
      });
    }
    if (trimmed.length > 200) {
      raiseApiError('INVALID_QUERY', 'Busca deve ter no máximo 200 caracteres.', {
        param: 'q',
      });
    }
    q = trimmed.length > 0 ? trimmed : undefined;
  }

  const result = await getAdminOrderService().listOrders({
    status,
    q,
    cursor: query.cursor,
    limit,
  });

  const body = buildPaginatedResponse(
    result.items.map(toPublicOrder),
    result.lastEvaluatedKey,
    {
      index: result.index,
      filters: result.filters,
    },
  );

  return ok(body, context.requestId);
}
