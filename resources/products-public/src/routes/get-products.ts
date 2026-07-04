import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { raiseApiError, CategoryEnum } from '@afro90s/models';
import type { ApiContext } from '@afro90s/http';
import { ok } from '@afro90s/http';
import { buildPaginatedResponse, parseLimit } from '@afro90s/pagination';
import { getProductRepository, toPublicProduct } from '@afro90s/repositories';

export async function handleGetProducts(event: APIGatewayProxyEventV2, context: ApiContext) {
  const query = event.queryStringParameters ?? {};
  const limit = parseLimit(query.limit);

  if (query.category && !CategoryEnum.safeParse(query.category).success) {
    raiseApiError('INVALID_QUERY', 'Categoria inválida.', {
      param: 'category',
      value: query.category ?? '',
    });
  }

  const result = await getProductRepository().list({
    name: query.name,
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
