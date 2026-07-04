import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { ApiError } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { noContent } from '@afro90s/http';
import { extractAdminProductId } from '../lib/request';
import { getAdminProductService } from '../services/product.service';

const productIdSchema = z.string().uuid();

export async function handleDeleteAdminProduct(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const parsed = productIdSchema.safeParse(extractAdminProductId(event));
  if (!parsed.success) {
    throw new ApiError('VALIDATION_ERROR', 'ID do produto inválido.', { id: 'UUID inválido' });
  }

  await getAdminProductService().deleteProduct(parsed.data);
  return noContent(context.requestId);
}
