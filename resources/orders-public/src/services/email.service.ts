import type { Order } from '@afro90s/models';
import { getLogger } from '@afro90s/logger';

const logger = getLogger().child({ module: 'orders-public', component: 'email' });

export async function sendOrderNotification(order: Order): Promise<void> {
  if (process.env.SES_ENABLED !== 'true') {
    logger.info('SES disabled, skipping email', { orderId: order.id });
    return;
  }

  // Fase 4: integração SES em task 16
  logger.info('SES enabled but not implemented yet', { orderId: order.id });
}
