import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { raiseApiError } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { getProductRepository, toPublicProduct } from '@afro90s/repositories';
import { extractAdminProductId } from '../lib/request';

const productIdSchema = z.string().uuid();

export async function handleGetAdminProductById(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const rawId = extractAdminProductId(event);
  const parsed = productIdSchema.safeParse(rawId);
  if (!parsed.success) {
    raiseApiError('VALIDATION_ERROR', 'ID do produto inválido.', {
      reason: 'invalid_uuid',
      idValue: rawId ?? 'missing',
    });
  }

  const product = await getProductRepository().getById(parsed.data);
  if (!product) {
    raiseApiError('NOT_FOUND', 'Produto não encontrado.', { productId: parsed.data });
  }

  return ok(toPublicProduct(product), context.requestId);
}
