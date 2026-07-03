import middy from '@middy/core';
import { isApiError } from '@afro90s/models';
import { ZodError } from 'zod';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';
import { isOptionsRequest, optionsResponse } from './cors';
import { toErrorResponse, zodErrorToDetails } from './errors';
import { apiError, internalError } from './response';
import { resolveRequestId } from './request-id';
import { requireAdminAuth } from './auth';

export interface ApiContext extends Context {
  requestId: string;
}

export interface AdminApiContext extends ApiContext {
  adminUserId: string;
}

export type ApiHandler = (
  event: APIGatewayProxyEventV2,
  context: ApiContext,
) => Promise<APIGatewayProxyStructuredResultV2>;

export type AdminApiHandler = (
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) => Promise<APIGatewayProxyStructuredResultV2>;

export function createHandler(fn: ApiHandler) {
  return middy(async (event: APIGatewayProxyEventV2, context: Context) => {
    const requestId = resolveRequestId(event);

    if (isOptionsRequest(event)) {
      return optionsResponse(requestId);
    }

    const apiContext = Object.assign(context, { requestId }) as ApiContext;

    try {
      return await fn(event, apiContext);
    } catch (error) {
      if (isApiError(error)) {
        return toErrorResponse(error, requestId);
      }

      if (error instanceof ZodError) {
        return apiError(
          400,
          'VALIDATION_ERROR',
          'Dados inválidos.',
          requestId,
          zodErrorToDetails(error),
        );
      }

      console.error('Unhandled error', { requestId, error });
      return internalError(requestId);
    }
  });
}

export function createAdminHandler(fn: AdminApiHandler) {
  return createHandler(async (event, context) => {
    const adminUserId = requireAdminAuth(event);
    const adminContext = Object.assign(context, { adminUserId }) as AdminApiContext;
    return fn(event, adminContext);
  });
}
