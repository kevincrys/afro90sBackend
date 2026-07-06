import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { raiseApiError } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { toPublicOrder } from '@afro90s/repositories';
import { extractAdminOrderId } from '../lib/request';
import { getAdminOrderService } from '../services/order.service';

const orderIdSchema = z.string().uuid();

export async function handleGetAdminOrderById(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const rawId = extractAdminOrderId(event);
  const parsed = orderIdSchema.safeParse(rawId);
  if (!parsed.success) {
    raiseApiError('VALIDATION_ERROR', 'ID do pedido inválido.', {
      reason: 'invalid_uuid',
      idValue: rawId ?? 'missing',
    });
  }

  const order = await getAdminOrderService().getOrder(parsed.data);
  return ok(toPublicOrder(order), context.requestId);
}
