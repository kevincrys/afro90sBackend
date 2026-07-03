import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ApiError } from '@afro90s/models';
import { createHandler } from '@afro90s/http';
import { handleGetProducts } from './routes/get-products';

function matchProductsList(event: APIGatewayProxyEventV2): boolean {
  return (
    event.requestContext.http.method === 'GET' &&
    (event.rawPath === '/products' || event.routeKey === 'GET /products')
  );
}

export const handler = createHandler(async (event, context) => {
  if (matchProductsList(event)) {
    return handleGetProducts(event, context);
  }

  throw new ApiError('NOT_FOUND', 'Rota não encontrada.');
});
