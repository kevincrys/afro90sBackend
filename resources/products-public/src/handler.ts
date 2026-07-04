import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { raiseApiError } from '@afro90s/models';
import { createHandler, requestLogContext } from '@afro90s/http';
import { handleGetProductById } from './routes/get-product-by-id';
import { handleGetProducts } from './routes/get-products';

function matchProductsList(event: APIGatewayProxyEventV2): boolean {
  return (
    event.requestContext.http.method === 'GET' &&
    (event.rawPath === '/products' || event.routeKey === 'GET /products')
  );
}

function matchProductById(event: APIGatewayProxyEventV2): boolean {
  if (event.requestContext.http.method !== 'GET') {
    return false;
  }

  if (event.routeKey === 'GET /products/{id}') {
    return true;
  }

  return /^\/products\/[^/]+$/.test(event.rawPath);
}

export const handler = createHandler(async (event, context) => {
  if (matchProductsList(event)) {
    return handleGetProducts(event, context);
  }

  if (matchProductById(event)) {
    return handleGetProductById(event, context);
  }

  raiseApiError('NOT_FOUND', 'Rota não encontrada.', requestLogContext(event));
});
