import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient, getOrdersTableName } from '@afro90s/dynamodb';
import {
  raiseApiError,
  OrderSchema,
  normalizeNameLower,
  isValidOrderStatusTransition,
  type Order,
  type OrderStatus,
} from '@afro90s/models';
import { decodeCursor, type CursorFilters } from '@afro90s/pagination';
import { z } from 'zod';

const GSI_STATUS_CREATED_AT = 'gsi-status-createdAt';
const LIST_INDEX_PRIMARY = 'primary' as const;
const TERMINAL_TTL_DAYS = 180;
const UUID_LIKE_PATTERN = /^[0-9a-f-]{8,}$/i;

export interface ListOrdersParams {
  status?: OrderStatus;
  q?: string;
  cursor?: string;
  limit: number;
}

export interface ListOrdersResult {
  items: Order[];
  lastEvaluatedKey?: Record<string, string>;
  index: typeof LIST_INDEX_PRIMARY | typeof GSI_STATUS_CREATED_AT;
  filters: CursorFilters;
}

function isFullUuid(value: string): boolean {
  return z.string().uuid().safeParse(value).success;
}

function isUuidLike(value: string): boolean {
  return UUID_LIKE_PATTERN.test(value);
}

function buildSearchFilters(params: ListOrdersParams & { q: string }): CursorFilters {
  return {
    q: params.q,
    ...(params.status !== undefined ? { status: params.status } : {}),
  };
}

export class OrderRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient = getDocClient(),
    private readonly tableName: string = getOrdersTableName(),
  ) {}

  async create(order: Order): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: order,
      }),
    );
  }

  async getById(id: string): Promise<Order | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    if (!result.Item) {
      return null;
    }

    return OrderSchema.parse(result.Item);
  }

  async list(params: ListOrdersParams): Promise<ListOrdersResult> {
    if (params.q !== undefined && params.q.length > 0) {
      return this.listWithSearch({ ...params, q: params.q });
    }

    if (params.status !== undefined) {
      return this.listByStatus({ ...params, status: params.status });
    }
    return this.listAll(params);
  }

  private async listWithSearch(params: ListOrdersParams & { q: string }): Promise<ListOrdersResult> {
    if (isFullUuid(params.q)) {
      return this.listByFullId(params);
    }
    if (isUuidLike(params.q)) {
      return this.listByIdPrefix(params);
    }
    return this.listByCustomerName(params);
  }

  private async listByFullId(
    params: ListOrdersParams & { q: string },
  ): Promise<ListOrdersResult> {
    const filters = buildSearchFilters(params);
    const order = await this.getById(params.q);

    if (!order) {
      return { items: [], index: LIST_INDEX_PRIMARY, filters };
    }

    if (params.status !== undefined && order.status !== params.status) {
      return { items: [], index: LIST_INDEX_PRIMARY, filters };
    }

    return {
      items: [order],
      index: LIST_INDEX_PRIMARY,
      filters,
    };
  }

  private async listByIdPrefix(
    params: ListOrdersParams & { q: string },
  ): Promise<ListOrdersResult> {
    const filters = buildSearchFilters(params);
    const index = params.status !== undefined ? GSI_STATUS_CREATED_AT : LIST_INDEX_PRIMARY;
    const exclusiveStartKey = params.cursor
      ? this.resolveStartKey(params.cursor, filters, index)
      : undefined;

    const names: Record<string, string> = { '#id': 'id' };
    const values: Record<string, string> = { ':q': params.q.toLowerCase() };
    const filterParts = ['begins_with(#id, :q)'];

    if (params.status !== undefined) {
      return this.queryWithFilter({
        status: params.status,
        filterParts,
        names,
        values,
        limit: params.limit,
        exclusiveStartKey,
        filters,
      });
    }

    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: filterParts.join(' AND '),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        Limit: params.limit,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    const items = this.sortByCreatedAtDesc(result.Items);

    return {
      items,
      lastEvaluatedKey: result.LastEvaluatedKey as Record<string, string> | undefined,
      index: LIST_INDEX_PRIMARY,
      filters,
    };
  }

  private async listByCustomerName(
    params: ListOrdersParams & { q: string },
  ): Promise<ListOrdersResult> {
    const prefix = normalizeNameLower(params.q);
    const filters = buildSearchFilters(params);
    const index = params.status !== undefined ? GSI_STATUS_CREATED_AT : LIST_INDEX_PRIMARY;
    const exclusiveStartKey = params.cursor
      ? this.resolveStartKey(params.cursor, filters, index)
      : undefined;

    const names: Record<string, string> = { '#customerNameLower': 'customerNameLower' };
    const values: Record<string, string> = { ':prefix': prefix };
    const filterParts = ['begins_with(#customerNameLower, :prefix)'];

    if (params.status !== undefined) {
      return this.queryWithFilter({
        status: params.status,
        filterParts,
        names,
        values,
        limit: params.limit,
        exclusiveStartKey,
        filters,
      });
    }

    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: filterParts.join(' AND '),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        Limit: params.limit,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    const items = this.sortByCreatedAtDesc(result.Items);

    return {
      items,
      lastEvaluatedKey: result.LastEvaluatedKey as Record<string, string> | undefined,
      index: LIST_INDEX_PRIMARY,
      filters,
    };
  }

  private async queryWithFilter(params: {
    status: OrderStatus;
    filterParts: string[];
    names: Record<string, string>;
    values: Record<string, string>;
    limit: number;
    exclusiveStartKey?: Record<string, string>;
    filters: CursorFilters;
  }): Promise<ListOrdersResult> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: GSI_STATUS_CREATED_AT,
        KeyConditionExpression: '#status = :status',
        FilterExpression: params.filterParts.join(' AND '),
        ExpressionAttributeNames: { '#status': 'status', ...params.names },
        ExpressionAttributeValues: { ':status': params.status, ...params.values },
        Limit: params.limit,
        ExclusiveStartKey: params.exclusiveStartKey,
        ScanIndexForward: false,
      }),
    );

    return {
      items: (result.Items ?? []).map((item) => OrderSchema.parse(item)),
      lastEvaluatedKey: result.LastEvaluatedKey as Record<string, string> | undefined,
      index: GSI_STATUS_CREATED_AT,
      filters: params.filters,
    };
  }

  private sortByCreatedAtDesc(items: Record<string, unknown>[] | undefined): Order[] {
    return (items ?? [])
      .map((item) => OrderSchema.parse(item))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private async listByStatus(params: ListOrdersParams & { status: OrderStatus }): Promise<ListOrdersResult> {
    const filters: CursorFilters = { status: params.status };
    const exclusiveStartKey = params.cursor
      ? this.resolveStartKey(params.cursor, filters, GSI_STATUS_CREATED_AT)
      : undefined;

    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: GSI_STATUS_CREATED_AT,
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': params.status },
        Limit: params.limit,
        ExclusiveStartKey: exclusiveStartKey,
        ScanIndexForward: false,
      }),
    );

    return {
      items: (result.Items ?? []).map((item) => OrderSchema.parse(item)),
      lastEvaluatedKey: result.LastEvaluatedKey as Record<string, string> | undefined,
      index: GSI_STATUS_CREATED_AT,
      filters,
    };
  }

  private async listAll(params: ListOrdersParams): Promise<ListOrdersResult> {
    const filters: CursorFilters = {};
    const exclusiveStartKey = params.cursor
      ? this.resolveStartKey(params.cursor, filters, LIST_INDEX_PRIMARY)
      : undefined;

    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        Limit: params.limit,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    const items = this.sortByCreatedAtDesc(result.Items);

    return {
      items,
      lastEvaluatedKey: result.LastEvaluatedKey as Record<string, string> | undefined,
      index: LIST_INDEX_PRIMARY,
      filters,
    };
  }

  async updateStatus(id: string, nextStatus: OrderStatus): Promise<Order | null> {
    const current = await this.getById(id);
    if (!current) {
      return null;
    }

    if (!isValidOrderStatusTransition(current.status, nextStatus)) {
      raiseApiError('INVALID_STATUS_TRANSITION', 'Transição de status não permitida.', {
        orderId: id,
        fromStatus: current.status,
        toStatus: nextStatus,
      });
    }

    const now = new Date().toISOString();
    const values: Record<string, unknown> = {
      ':status': nextStatus,
      ':updatedAt': now,
    };
    let updateExpression = 'SET #status = :status, updatedAt = :updatedAt';

    if (nextStatus === 'CONCLUIDO' || nextStatus === 'CANCELADO') {
      const expiresAt = Math.floor(Date.now() / 1000) + TERMINAL_TTL_DAYS * 86400;
      values[':expiresAt'] = expiresAt;
      updateExpression += ', expiresAt = :expiresAt';
    }

    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    );

    if (!result.Attributes) {
      return null;
    }

    return OrderSchema.parse(result.Attributes);
  }

  private resolveStartKey(
    cursor: string,
    filters: CursorFilters,
    expectedIndex: typeof LIST_INDEX_PRIMARY | typeof GSI_STATUS_CREATED_AT,
  ): Record<string, string> {
    const decoded = decodeCursor(cursor, filters);
    if (decoded.index !== expectedIndex) {
      raiseApiError('INVALID_CURSOR', 'Cursor inválido.', {
        reason: 'index_mismatch',
        expectedIndex,
        actualIndex: decoded.index,
      });
    }
    return decoded.key;
  }
}

let defaultRepository: OrderRepository | undefined;

export function getOrderRepository(): OrderRepository {
  if (!defaultRepository) {
    defaultRepository = new OrderRepository();
  }
  return defaultRepository;
}
