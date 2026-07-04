import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { ApiError } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { getProductRepository, toPublicProduct } from '@afro90s/repositories';
import { extractAdminProductId } from '../lib/request';

const productIdSchema = z.string().uuid();

export async function handleGetAdminProductById(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const parsed = productIdSchema.safeParse(extractAdminProductId(event));
  if (!parsed.success) {
    throw new ApiError('VALIDATION_ERROR', 'ID do produto inválido.', { id: 'UUID inválido' });
  }

  const product = await getProductRepository().getById(parsed.data);
  if (!product) {
    throw new ApiError('NOT_FOUND', 'Produto não encontrado.');
  }

  return ok(toPublicProduct(product), context.requestId);
}
