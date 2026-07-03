import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ApiError } from '@afro90s/models';
import { createHandler } from '@afro90s/http';
import { handlePostOrders } from './routes/post-orders';

function matchPostOrders(event: APIGatewayProxyEventV2): boolean {
  return (
    event.requestContext.http.method === 'POST' &&
    (event.rawPath === '/orders' || event.routeKey === 'POST /orders')
  );
}

export const handler = createHandler(async (event, context) => {
  if (matchPostOrders(event)) {
    return handlePostOrders(event, context);
  }

  throw new ApiError('NOT_FOUND', 'Rota não encontrada.');
});
