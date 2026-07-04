import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ApiError, CategoryEnum } from '@afro90s/models';
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
    throw new ApiError('INVALID_QUERY', 'Categoria inválida.');
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
