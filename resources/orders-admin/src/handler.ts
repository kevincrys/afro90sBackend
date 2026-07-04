import { raiseApiError } from '@afro90s/models';
import { createAdminHandler, requestLogContext } from '@afro90s/http';
import {
  isAdminOrderById,
  isAdminOrderUpdate,
  isAdminOrdersCollection,
} from './lib/request';
import { handleGetAdminOrderById } from './routes/get-admin-order-by-id';
import { handleGetAdminOrders } from './routes/get-admin-orders';
import { handlePutAdminOrder } from './routes/put-admin-order';

export const handler = createAdminHandler(async (event, context) => {
  if (isAdminOrdersCollection(event)) {
    return handleGetAdminOrders(event, context);
  }

  if (isAdminOrderUpdate(event)) {
    return handlePutAdminOrder(event, context);
  }

  if (isAdminOrderById(event)) {
    return handleGetAdminOrderById(event, context);
  }

  raiseApiError('NOT_FOUND', 'Rota não encontrada.', requestLogContext(event));
});
