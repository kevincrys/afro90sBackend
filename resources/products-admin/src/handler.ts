import { raiseApiError } from '@afro90s/models';
import { createAdminHandler, requestLogContext } from '@afro90s/http';
import {
  isAdminProductById,
  isAdminProductStock,
  isAdminProductsCollection,
} from './lib/request';
import { handleDeleteAdminProduct } from './routes/delete-admin-product';
import { handleGetAdminProductById } from './routes/get-admin-product-by-id';
import { handleGetAdminProducts } from './routes/get-admin-products';
import { handlePutAdminProductStock } from './routes/put-admin-product-stock';
import { handlePostAdminProducts } from './routes/post-admin-products';
import { handlePutAdminProduct } from './routes/put-admin-product';

export const handler = createAdminHandler(async (event, context) => {
  if (isAdminProductsCollection(event)) {
    if (event.requestContext.http.method === 'GET') {
      return handleGetAdminProducts(event, context);
    }
    return handlePostAdminProducts(event, context);
  }

  if (isAdminProductStock(event)) {
    return handlePutAdminProductStock(event, context);
  }

  if (isAdminProductById(event)) {
    switch (event.requestContext.http.method) {
      case 'GET':
        return handleGetAdminProductById(event, context);
      case 'PUT':
        return handlePutAdminProduct(event, context);
      case 'DELETE':
        return handleDeleteAdminProduct(event, context);
      default:
        break;
    }
  }

  raiseApiError('NOT_FOUND', 'Rota não encontrada.', requestLogContext(event));
});
