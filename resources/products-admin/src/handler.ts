import { createAdminHandler, ok } from '@afro90s/http';

const FLOW = 'products-admin';

export const handler = createAdminHandler(async (event, { requestId, adminUserId }) => {
  return ok(
    {
      ok: true,
      flow: FLOW,
      path: event.rawPath,
      adminUserId,
      message: 'afro90s API placeholder',
    },
    requestId,
  );
});
