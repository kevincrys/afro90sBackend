import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';
import type { Order, OrderItem } from '@afro90s/models';
import { getLogger } from '@afro90s/logger';

const logger = getLogger().child({ module: 'orders-public', component: 'email' });

let sesClient: SESClient | undefined;

export function getSesClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
    });
  }
  return sesClient;
}

/** @internal test helper */
export function resetSesClientForTests(): void {
  sesClient = undefined;
}

/** @internal test helper */
export function setSesClientForTests(client: SESClient | undefined): void {
  sesClient = client;
}

export function formatBrl(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function lineTotal(item: OrderItem): number {
  return (Math.round(item.unitPrice * 100) * item.quantity) / 100;
}

export function buildItemsSummary(order: Order): string {
  return order.items
    .map((item) => {
      const option = item.selectedOption ? ` (${item.selectedOption})` : '';
      const unit = formatBrl(item.unitPrice);
      const total = formatBrl(lineTotal(item));
      return `${item.quantity}x ${item.productName}${option} — ${unit} un. / ${total}`;
    })
    .join('; ');
}

export async function sendOrderNotification(order: Order): Promise<void> {
  if (process.env.SES_ENABLED !== 'true') {
    logger.info('SES disabled, skipping email', { orderId: order.id });
    return;
  }

  const from = process.env.SES_FROM_EMAIL;
  const to = process.env.ADMIN_EMAIL;
  const templateName = process.env.SES_TEMPLATE_NAME;

  if (!from || !to || !templateName) {
    logger.error('SES enabled but SES_FROM_EMAIL, ADMIN_EMAIL or SES_TEMPLATE_NAME missing', {
      orderId: order.id,
    });
    return;
  }

  try {
    await getSesClient().send(
      new SendTemplatedEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        Template: templateName,
        TemplateData: JSON.stringify({
          orderId: order.id,
          customerName: order.customer.name,
          itemsSummary: buildItemsSummary(order),
          fullPrice: formatBrl(order.fullPrice),
        }),
      }),
    );
    logger.info('Order notification email sent', { orderId: order.id });
  } catch (err) {
    logger.error('Failed to send order notification email', {
      orderId: order.id,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
