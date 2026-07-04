import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export function extractAdminOrderId(event: APIGatewayProxyEventV2): string | undefined {
  if (event.pathParameters?.id) {
    return event.pathParameters.id;
  }

  const match = event.rawPath.match(/^\/admin\/orders\/([^/]+)(?:\/status)?$/);
  return match?.[1];
}

export function isAdminOrdersCollection(event: APIGatewayProxyEventV2): boolean {
  if (event.requestContext.http.method !== 'GET') {
    return false;
  }
  return event.routeKey === 'GET /admin/orders' || event.rawPath === '/admin/orders';
}

export function isAdminOrderById(event: APIGatewayProxyEventV2): boolean {
  if (event.requestContext.http.method !== 'GET') {
    return false;
  }
  if (event.routeKey === 'GET /admin/orders/{id}') {
    return true;
  }
  return /^\/admin\/orders\/[^/]+$/.test(event.rawPath);
}

export function isAdminOrderStatus(event: APIGatewayProxyEventV2): boolean {
  if (event.requestContext.http.method !== 'PATCH') {
    return false;
  }
  if (event.routeKey === 'PATCH /admin/orders/{id}/status') {
    return true;
  }
  return /^\/admin\/orders\/[^/]+\/status$/.test(event.rawPath);
}
