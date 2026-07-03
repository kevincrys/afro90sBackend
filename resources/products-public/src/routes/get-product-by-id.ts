import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { ApiError } from '@afro90s/models';
import type { ApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { getProductRepository, toPublicProduct } from '@afro90s/repositories';

const productIdSchema = z.string().uuid();

export function extractProductId(event: APIGatewayProxyEventV2): string | undefined {
  if (event.pathParameters?.id) {
    return event.pathParameters.id;
  }

  const match = event.rawPath.match(/^\/products\/([^/]+)$/);
  return match?.[1];
}

export async function handleGetProductById(event: APIGatewayProxyEventV2, context: ApiContext) {
  const rawId = extractProductId(event);

  const parsed = productIdSchema.safeParse(rawId);
  if (!parsed.success) {
    throw new ApiError('VALIDATION_ERROR', 'ID do produto inválido.', { id: 'UUID inválido' });
  }

  const product = await getProductRepository().getById(parsed.data);
  if (!product) {
    throw new ApiError('NOT_FOUND', 'Produto não encontrado.');
  }

  return ok(toPublicProduct(product), context.requestId);
}
