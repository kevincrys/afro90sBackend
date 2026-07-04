import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { raiseApiError } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { noContent } from '@afro90s/http';
import { extractAdminProductId } from '../lib/request';
import { getAdminProductService } from '../services/product.service';

const productIdSchema = z.string().uuid();

export async function handleDeleteAdminProduct(
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

  await getAdminProductService().deleteProduct(parsed.data);
  return noContent(context.requestId);
}
