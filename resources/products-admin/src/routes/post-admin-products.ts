import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { AdminApiContext } from '@afro90s/http';
import { created } from '@afro90s/http';
import { toPublicProduct } from '@afro90s/repositories';
import { parseAdminCreateBody } from '../lib/parse-product-body';
import { getAdminProductService } from '../services/product.service';

export async function handlePostAdminProducts(
  event: APIGatewayProxyEventV2,
  context: AdminApiContext,
) {
  const { body, files } = await parseAdminCreateBody(event);
  const product = await getAdminProductService().createProduct(body, files);
  return created(toPublicProduct(product), context.requestId);
}
