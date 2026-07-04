import { ApiError } from '@afro90s/models';
import { createAdminHandler } from '@afro90s/http';
import {
  isAdminOrderById,
  isAdminOrderStatus,
  isAdminOrdersCollection,
} from './lib/request';
import { handleGetAdminOrderById } from './routes/get-admin-order-by-id';
import { handleGetAdminOrders } from './routes/get-admin-orders';
import { handlePatchAdminOrderStatus } from './routes/patch-admin-order-status';

export const handler = createAdminHandler(async (event, context) => {
  if (isAdminOrdersCollection(event)) {
    return handleGetAdminOrders(event, context);
  }

  if (isAdminOrderStatus(event)) {
    return handlePatchAdminOrderStatus(event, context);
  }

  if (isAdminOrderById(event)) {
    return handleGetAdminOrderById(event, context);
  }

  throw new ApiError('NOT_FOUND', 'Rota não encontrada.');
});
