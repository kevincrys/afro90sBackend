import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export function getContentType(event: APIGatewayProxyEventV2): string {
  const headers = event.headers ?? {};
  return headers['content-type'] ?? headers['Content-Type'] ?? '';
}

export function isMultipartRequest(event: APIGatewayProxyEventV2): boolean {
  return getContentType(event).toLowerCase().includes('multipart/form-data');
}

export function readRequestBody(event: APIGatewayProxyEventV2): Buffer {
  if (!event.body) {
    return Buffer.alloc(0);
  }
  return event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : Buffer.from(event.body, 'utf8');
}

export function extractAdminProductId(event: APIGatewayProxyEventV2): string | undefined {
  if (event.pathParameters?.id) {
    return event.pathParameters.id;
  }

  const match = event.rawPath.match(/^\/admin\/products\/([^/]+)(?:\/stock)?$/);
  return match?.[1];
}

export function isAdminProductsCollection(event: APIGatewayProxyEventV2): boolean {
  const method = event.requestContext.http.method;
  if (method !== 'GET' && method !== 'POST') {
    return false;
  }
  return (
    event.routeKey === `${method} /admin/products` ||
    event.rawPath === '/admin/products'
  );
}

export function isAdminProductById(event: APIGatewayProxyEventV2): boolean {
  const method = event.requestContext.http.method;
  if (method !== 'GET' && method !== 'PUT' && method !== 'DELETE') {
    return false;
  }
  if (event.routeKey === `${method} /admin/products/{id}`) {
    return true;
  }
  return /^\/admin\/products\/[^/]+$/.test(event.rawPath);
}

export function isAdminProductStock(event: APIGatewayProxyEventV2): boolean {
  if (event.requestContext.http.method !== 'PATCH') {
    return false;
  }
  if (event.routeKey === 'PATCH /admin/products/{id}/stock') {
    return true;
  }
  return /^\/admin\/products\/[^/]+\/stock$/.test(event.rawPath);
}
