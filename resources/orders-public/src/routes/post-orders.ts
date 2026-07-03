import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { CreateOrderSchema } from '@afro90s/models';
import type { ApiContext } from '@afro90s/http';
import { created, parseOrThrow, throwValidationError } from '@afro90s/http';
import { createOrder } from '../services/order.service';

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

export async function handlePostOrders(event: APIGatewayProxyEventV2, context: ApiContext) {
  const body = parseJsonBody(event);
  const input = parseOrThrow(CreateOrderSchema, body);
  const result = await createOrder(input);
  return created(result, context.requestId);
}
