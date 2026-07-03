import type { Order } from '@afro90s/models';

export async function sendOrderNotification(order: Order): Promise<void> {
  if (process.env.SES_ENABLED !== 'true') {
    console.log('SES disabled, skipping email', { orderId: order.id });
    return;
  }

  // Fase 4: integração SES em task 16
  console.log('SES enabled but not implemented yet', { orderId: order.id });
}
