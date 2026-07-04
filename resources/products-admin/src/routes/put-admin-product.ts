import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { ApiError } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { toPublicProduct } from '@afro90s/repositories';
import { parseAdminUpdateBody } from '../lib/parse-product-body';
import { extractAdminProductId } from '../lib/request';
import { getAdminProductService } from '../services/product.service';

const productIdSchema = z.string().uuid();

export async function handlePutAdminProduct(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const parsed = productIdSchema.safeParse(extractAdminProductId(event));
  if (!parsed.success) {
    throw new ApiError('VALIDATION_ERROR', 'ID do produto inválido.', { id: 'UUID inválido' });
  }

  const { body, files } = await parseAdminUpdateBody(event);
  const product = await getAdminProductService().updateProduct(parsed.data, body, files);
  return ok(toPublicProduct(product), context.requestId);
}
