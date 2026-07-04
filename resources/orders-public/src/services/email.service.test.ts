import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Order } from '@afro90s/models';
import { sendOrderNotification } from './email.service';

describe('sendOrderNotification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SES_ENABLED;
  });

  it('logs and skips when SES is disabled', async () => {
    process.env.SES_ENABLED = 'false';
    process.env.LOG_LEVEL = 'info';
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const order = { id: '7c9e6679-7425-40de-944b-e07fc1f90ae7' } as Order;
    await sendOrderNotification(order);

    expect(logSpy).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(logSpy.mock.calls[0][0]));
    expect(payload).toMatchObject({
      level: 'info',
      message: 'SES disabled, skipping email',
      orderId: order.id,
      module: 'orders-public',
      component: 'email',
    });

    logSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });
});
