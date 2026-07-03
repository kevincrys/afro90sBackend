import { createHandler, ok } from '@afro90s/http';

const FLOW = 'orders-admin';

export const handler = createHandler(async (event, { requestId }) => {
  return ok(
    {
      ok: true,
      flow: FLOW,
      path: event.rawPath,
      message: 'afro90s API placeholder',
    },
    requestId,
  );
});
