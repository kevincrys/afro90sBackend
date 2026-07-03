import middy from '@middy/core';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';
import { isOptionsRequest, optionsResponse, withCors } from './cors';
import { internalError } from './response';
import { resolveRequestId } from './request-id';

export interface ApiContext extends Context {
  requestId: string;
}

export type ApiHandler = (
  event: APIGatewayProxyEventV2,
  context: ApiContext,
) => Promise<APIGatewayProxyStructuredResultV2>;

export function createHandler(fn: ApiHandler) {
  return middy(async (event: APIGatewayProxyEventV2, context: Context) => {
    const requestId = resolveRequestId(event);

    if (isOptionsRequest(event)) {
      return optionsResponse(requestId);
    }

    const apiContext = Object.assign(context, { requestId }) as ApiContext;

    try {
      const result = await fn(event, apiContext);
      return withCors(result, requestId);
    } catch (error) {
      console.error('Unhandled error', { requestId, error });
      return withCors(internalError(requestId), requestId);
    }
  });
}
