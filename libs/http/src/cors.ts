import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

const ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization';

export function getAllowedOrigin(): string {
  const cloudfront = process.env.CLOUDFRONT_WEB_URL?.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'development') {
    return cloudfront || 'http://localhost:5173';
  }
  return cloudfront || '*';
}

export function isOptionsRequest(event: APIGatewayProxyEventV2): boolean {
  return event.requestContext.http.method === 'OPTIONS';
}

export function corsHeaders(requestId: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(),
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'X-Request-Id': requestId,
  };
}

export function optionsResponse(requestId: string): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode: 204,
    headers: corsHeaders(requestId),
    body: '',
  };
}

export function withCors(
  result: APIGatewayProxyStructuredResultV2,
  requestId: string,
): APIGatewayProxyStructuredResultV2 {
  return {
    ...result,
    headers: {
      ...result.headers,
      ...corsHeaders(requestId),
    },
  };
}
