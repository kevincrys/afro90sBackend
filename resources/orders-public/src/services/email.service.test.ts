import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Order } from '@afro90s/models';
import {
  buildItemsSummary,
  formatBrl,
  resetSesClientForTests,
  sendOrderNotification,
  setSesClientForTests,
} from './email.service';

const sampleOrder = {
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  status: 'SOLICITADO',
  fullPrice: 89.9,
  customer: {
    name: 'Maria Silva',
    address: 'Rua Exemplo, 123',
    postalCode: '01310100',
    tel: '11999998888',
  },
  items: [
    {
      productId: '550e8400-e29b-41d4-a716-446655440000',
      productName: 'Óculos Vintage',
      quantity: 2,
      unitPrice: 44.95,
      selectedOption: 'Preto',
    },
  ],
  createdAt: '2026-07-10T12:00:00.000Z',
  updatedAt: '2026-07-10T12:00:00.000Z',
} as Order;

describe('sendOrderNotification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetSesClientForTests();
    delete process.env.SES_ENABLED;
    delete process.env.SES_FROM_EMAIL;
    delete process.env.ADMIN_EMAIL;
    delete process.env.SES_TEMPLATE_NAME;
    delete process.env.LOG_LEVEL;
  });

  it('logs and skips when SES is disabled', async () => {
    process.env.SES_ENABLED = 'false';
    process.env.LOG_LEVEL = 'info';
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await sendOrderNotification(sampleOrder);

    expect(logSpy).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(logSpy.mock.calls[0][0]));
    expect(payload).toMatchObject({
      level: 'info',
      message: 'SES disabled, skipping email',
      orderId: sampleOrder.id,
    });
  });

  it('sends templated email when SES is enabled', async () => {
    process.env.SES_ENABLED = 'true';
    process.env.SES_FROM_EMAIL = 'noreply@example.com';
    process.env.ADMIN_EMAIL = 'ops@example.com';
    process.env.SES_TEMPLATE_NAME = 'afro90s-dev-ses-new-order';
    process.env.LOG_LEVEL = 'info';

    const send = vi.fn().mockResolvedValue({});
    setSesClientForTests({ send } as never);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await sendOrderNotification(sampleOrder);

    expect(send).toHaveBeenCalledOnce();
    const command = send.mock.calls[0][0];
    expect(command.input).toMatchObject({
      Source: 'noreply@example.com',
      Destination: { ToAddresses: ['ops@example.com'] },
      Template: 'afro90s-dev-ses-new-order',
    });
    expect(JSON.parse(command.input.TemplateData)).toEqual({
      orderId: sampleOrder.id,
      customerName: 'Maria Silva',
      itemsSummary: `2x Óculos Vintage (Preto) — ${formatBrl(44.95)} un. / ${formatBrl(89.9)}`,
      fullPrice: formatBrl(89.9),
    });

    const payload = JSON.parse(String(logSpy.mock.calls.at(-1)?.[0]));
    expect(payload.message).toBe('Order notification email sent');
  });

  it('logs error and does not throw when SES fails', async () => {
    process.env.SES_ENABLED = 'true';
    process.env.SES_FROM_EMAIL = 'noreply@example.com';
    process.env.ADMIN_EMAIL = 'ops@example.com';
    process.env.SES_TEMPLATE_NAME = 'afro90s-dev-ses-new-order';
    process.env.LOG_LEVEL = 'info';

    const send = vi.fn().mockRejectedValue(new Error('SES boom'));
    setSesClientForTests({ send } as never);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(sendOrderNotification(sampleOrder)).resolves.toBeUndefined();

    const payload = JSON.parse(String(errorSpy.mock.calls.at(-1)?.[0]));
    expect(payload).toMatchObject({
      level: 'error',
      message: 'Failed to send order notification email',
      orderId: sampleOrder.id,
      error: 'SES boom',
    });
  });

  it('buildItemsSummary includes option and prices', () => {
    expect(buildItemsSummary(sampleOrder)).toBe(
      `2x Óculos Vintage (Preto) — ${formatBrl(44.95)} un. / ${formatBrl(89.9)}`,
    );
  });
});
