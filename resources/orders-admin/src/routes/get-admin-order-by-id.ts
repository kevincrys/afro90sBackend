import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { ApiError } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { extractAdminOrderId } from '../lib/request';
import { getAdminOrderService } from '../services/order.service';

const orderIdSchema = z.string().uuid();

export async function handleGetAdminOrderById(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const parsed = orderIdSchema.safeParse(extractAdminOrderId(event));
  if (!parsed.success) {
    throw new ApiError('VALIDATION_ERROR', 'ID do pedido inválido.', { id: 'UUID inválido' });
  }

  const order = await getAdminOrderService().getOrder(parsed.data);
  return ok(order, context.requestId);
}
