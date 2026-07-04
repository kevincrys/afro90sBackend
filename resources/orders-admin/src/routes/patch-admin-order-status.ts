import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { ApiError, UpdateOrderStatusSchema } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok, parseOrThrow, throwValidationError } from '@afro90s/http';
import { extractAdminOrderId } from '../lib/request';
import { getAdminOrderService } from '../services/order.service';

const orderIdSchema = z.string().uuid();

function parseJsonBody(event: APIGatewayProxyEventV2): unknown {
  if (!event.body) {
    throwValidationError({ body: 'Corpo da requisição é obrigatório.' });
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throwValidationError({ body: 'JSON inválido.' });
  }
}

export async function handlePatchAdminOrderStatus(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const parsed = orderIdSchema.safeParse(extractAdminOrderId(event));
  if (!parsed.success) {
    throw new ApiError('VALIDATION_ERROR', 'ID do pedido inválido.', { id: 'UUID inválido' });
  }

  const input = parseOrThrow(UpdateOrderStatusSchema, parseJsonBody(event));
  const order = await getAdminOrderService().updateOrderStatus(parsed.data, input.status);
  return ok(order, context.requestId);
}
