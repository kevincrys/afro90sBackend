import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ApiError } from '@afro90s/models';
import { handler } from './handler';

const listOrders = vi.fn();
const getOrder = vi.fn();
const updateOrderStatus = vi.fn();

vi.mock('./services/order.service', () => ({
  getAdminOrderService: () => ({
    listOrders,
    getOrder,
    updateOrderStatus,
  }),
}));

const ORDER_ID = '550e8400-e29b-41d4-a716-446655440000';

const order = {
  id: ORDER_ID,
  status: 'SOLICITADO',
  items: [{ productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 1, unitPrice: 10 }],
  fullPrice: 10,
  customer: {
    name: 'Maria',
    address: 'Rua A',
    postalCode: '01310100',
    tel: '11999999999',
  },
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

function adminEvent(
  overrides: Partial<APIGatewayProxyEventV2> = {},
  claims: Record<string, unknown> = { sub: 'admin-uuid', 'cognito:groups': 'admins' },
): APIGatewayProxyEventV2 {
  return {
    rawPath: '/admin/orders',
    headers: { authorization: 'Bearer test-token' },
    queryStringParameters: {},
    requestContext: {
      http: { method: 'GET' },
      authorizer: { jwt: { claims } },
    },
    ...overrides,
  } as APIGatewayProxyEventV2;
}

describe('orders-admin handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ORDERS_TABLE = 'test-orders';
  });

  it('returns 401 when jwt claims are missing', async () => {
    const result = await handler(
      adminEvent({ requestContext: { http: { method: 'GET' } } } as APIGatewayProxyEventV2),
      {} as Context,
    );
    expect(result.statusCode).toBe(401);
  });

  it('routes GET /admin/orders', async () => {
    listOrders.mockResolvedValueOnce({ items: [order], index: 'primary', filters: {} });
    const result = await handler(adminEvent(), {} as Context);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body as string)).toMatchObject({ items: [{ id: ORDER_ID }] });
  });

  it('routes GET /admin/orders with status filter', async () => {
    listOrders.mockResolvedValueOnce({
      items: [order],
      index: 'gsi-status-createdAt',
      filters: { status: 'SOLICITADO' },
    });
    const result = await handler(
      adminEvent({ queryStringParameters: { status: 'SOLICITADO' } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(200);
    expect(listOrders).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'SOLICITADO' }),
    );
  });

  it('routes GET /admin/orders/{id}', async () => {
    getOrder.mockResolvedValueOnce(order);
    const result = await handler(
      adminEvent({
        rawPath: `/admin/orders/${ORDER_ID}`,
        pathParameters: { id: ORDER_ID },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body as string)).toMatchObject({ id: ORDER_ID });
  });

  it('returns 404 when order is missing', async () => {
    getOrder.mockRejectedValueOnce(new ApiError('NOT_FOUND', 'Pedido não encontrado.'));
    const result = await handler(
      adminEvent({
        rawPath: `/admin/orders/${ORDER_ID}`,
        pathParameters: { id: ORDER_ID },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(404);
  });

  it('routes PUT /admin/orders/{id}', async () => {
    updateOrderStatus.mockResolvedValueOnce({ ...order, status: 'EM_ATENDIMENTO' });
    const result = await handler(
      adminEvent({
        rawPath: `/admin/orders/${ORDER_ID}`,
        pathParameters: { id: ORDER_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'EM_ATENDIMENTO' }),
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body as string)).toMatchObject({ status: 'EM_ATENDIMENTO' });
  });

  it('returns 409 for invalid status transition', async () => {
    updateOrderStatus.mockRejectedValueOnce(
      new ApiError('INVALID_STATUS_TRANSITION', 'Transição de status não permitida.'),
    );
    const result = await handler(
      adminEvent({
        rawPath: `/admin/orders/${ORDER_ID}`,
        pathParameters: { id: ORDER_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'ENVIADO' }),
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(409);
  });

  it('returns 400 for invalid order id', async () => {
    const result = await handler(
      adminEvent({
        rawPath: '/admin/orders/not-a-uuid',
        pathParameters: { id: 'not-a-uuid' },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 for invalid status query filter', async () => {
    const result = await handler(
      adminEvent({ queryStringParameters: { status: 'invalid' } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('routes GET /admin/orders with q filter', async () => {
    listOrders.mockResolvedValueOnce({ items: [order], index: 'primary', filters: { q: 'maria' } });
    const result = await handler(
      adminEvent({ queryStringParameters: { q: 'maria' } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(200);
    expect(listOrders).toHaveBeenCalledWith(expect.objectContaining({ q: 'maria' }));
    expect(JSON.parse(result.body as string).items[0]).not.toHaveProperty('customerNameLower');
  });

  it('returns 400 when q is too short', async () => {
    const result = await handler(
      adminEvent({ queryStringParameters: { q: 'a' } }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 for invalid PUT status body', async () => {
    const result = await handler(
      adminEvent({
        rawPath: `/admin/orders/${ORDER_ID}`,
        pathParameters: { id: ORDER_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'INVALID' }),
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 when PUT status has no body', async () => {
    const result = await handler(
      adminEvent({
        rawPath: `/admin/orders/${ORDER_ID}`,
        pathParameters: { id: ORDER_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 when PUT status body is invalid JSON', async () => {
    const result = await handler(
      adminEvent({
        rawPath: `/admin/orders/${ORDER_ID}`,
        pathParameters: { id: ORDER_ID },
        requestContext: {
          http: { method: 'PUT' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
        headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
        body: '{',
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(400);
  });

  it('returns 404 for unknown routes', async () => {
    const result = await handler(
      adminEvent({
        rawPath: '/admin/unknown',
        requestContext: {
          http: { method: 'GET' },
          authorizer: { jwt: { claims: { sub: 'admin-uuid', 'cognito:groups': 'admins' } } },
        },
      }),
      {} as Context,
    );
    expect(result.statusCode).toBe(404);
  });

  it('responds to OPTIONS with 204 without auth', async () => {
    const result = await handler(
      adminEvent({ requestContext: { http: { method: 'OPTIONS' } } } as APIGatewayProxyEventV2),
      {} as Context,
    );
    expect(result.statusCode).toBe(204);
  });
});
