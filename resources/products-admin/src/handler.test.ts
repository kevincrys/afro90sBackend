import { describe, expect, it } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { handler } from './handler';

function adminEvent(
  overrides: Partial<APIGatewayProxyEventV2> = {},
  claims: Record<string, unknown> = { sub: 'admin-uuid', 'cognito:groups': 'admins' },
): APIGatewayProxyEventV2 {
  return {
    rawPath: '/admin/products',
    headers: { authorization: 'Bearer test-token' },
    requestContext: {
      http: { method: 'GET' },
      authorizer: { jwt: { claims } },
    },
    ...overrides,
  } as APIGatewayProxyEventV2;
}

describe('products-admin handler', () => {
  it('returns 200 with adminUserId when token has admins group', async () => {
    const result = await handler(adminEvent(), {} as Context);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body as string);
    expect(body).toMatchObject({
      ok: true,
      flow: 'products-admin',
      path: '/admin/products',
      adminUserId: 'admin-uuid',
    });
  });

  it('returns 401 when jwt claims are missing', async () => {
    const result = await handler(
      adminEvent({ requestContext: { http: { method: 'GET' } } } as APIGatewayProxyEventV2),
      {} as Context,
    );
    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body as string)).toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('returns 401 when user is not in admins group', async () => {
    const result = await handler(
      adminEvent({}, { sub: 'user-1', 'cognito:groups': 'users' }),
      {} as Context,
    );
    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body as string)).toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('responds to OPTIONS with 204 without auth', async () => {
    const result = await handler(
      adminEvent({ requestContext: { http: { method: 'OPTIONS' } } } as APIGatewayProxyEventV2),
      {} as Context,
    );
    expect(result.statusCode).toBe(204);
  });
});
