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
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const order = { id: '7c9e6679-7425-40de-944b-e07fc1f90ae7' } as Order;
    await sendOrderNotification(order);

    expect(logSpy).toHaveBeenCalledWith('SES disabled, skipping email', { orderId: order.id });
  });
});
