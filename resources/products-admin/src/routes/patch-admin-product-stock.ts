import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';
import { raiseApiError, UpdateStockSchema } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok, parseOrThrow, throwValidationError } from '@afro90s/http';
import { extractAdminProductId } from '../lib/request';
import { getAdminProductService } from '../services/product.service';

const productIdSchema = z.string().uuid();

function parseJsonBody(event: APIGatewayProxyEventV2): unknown {
  if (!event.body) {
    throwValidationError({ body: 'Corpo da requisição é obrigatório.' });
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throwValidationError({ body: 'JSON inválido.' });
  }
}

export async function handlePatchAdminProductStock(
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

  const input = parseOrThrow(UpdateStockSchema, parseJsonBody(event));
  const result = await getAdminProductService().updateStock(parsed.data, input);
  return ok(result, context.requestId);
}
