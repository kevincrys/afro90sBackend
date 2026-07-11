import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { raiseApiError, CategoryEnum } from '@afro90s/models';
import type { AdminApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { buildPaginatedResponse, parseLimit } from '@afro90s/pagination';
import { getProductRepository, toPublicProduct } from '@afro90s/repositories';

export async function handleGetAdminProducts(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const query = event.queryStringParameters ?? {};
  const limit = parseLimit(query.limit);

  if (query.category && !CategoryEnum.safeParse(query.category).success) {
    raiseApiError('INVALID_QUERY', 'Categoria inválida.', {
      param: 'category',
      value: query.category ?? '',
    });
  }

  let q: string | undefined;
  if (query.q !== undefined) {
    const trimmed = query.q.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      raiseApiError('INVALID_QUERY', 'Busca deve ter ao menos 2 caracteres.', {
        param: 'q',
        value: query.q,
      });
    }
    if (trimmed.length > 120) {
      raiseApiError('INVALID_QUERY', 'Busca deve ter no máximo 120 caracteres.', {
        param: 'q',
      });
    }
    q = trimmed.length > 0 ? trimmed : undefined;
  }

  // Prefer unified `q`; keep `name` as legacy name-only alias when `q` is absent.
  const result = await getProductRepository().list({
    q,
    name: q ? undefined : query.name,
    category: query.category,
    cursor: query.cursor,
    limit,
  });

  const body = buildPaginatedResponse(
    result.items.map(toPublicProduct),
    result.lastEvaluatedKey,
    { index: result.index, filters: result.filters },
  );

  return ok(body, context.requestId);
}
