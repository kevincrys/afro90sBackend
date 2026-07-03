import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient, getOrdersTableName } from '@afro90s/dynamodb';
import {
  ApiError,
  OrderSchema,
  isValidOrderStatusTransition,
  type Order,
  type OrderStatus,
} from '@afro90s/models';
import { decodeCursor, type CursorFilters } from '@afro90s/pagination';

const GSI_STATUS_CREATED_AT = 'gsi-status-createdAt';
const TERMINAL_TTL_DAYS = 180;

export interface ListOrdersParams {
  status?: OrderStatus;
  cursor?: string;
  limit: number;
}

export interface ListOrdersResult {
  items: Order[];
  lastEvaluatedKey?: Record<string, string>;
  filters: CursorFilters;
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
    if (!params.status) {
      throw new ApiError('INVALID_QUERY', 'Parâmetro status é obrigatório.');
    }

    const filters: CursorFilters = { status: params.status };
    const exclusiveStartKey = params.cursor
      ? this.resolveStartKey(params.cursor, filters)
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
      filters,
    };
  }

  async updateStatus(id: string, nextStatus: OrderStatus): Promise<Order | null> {
    const current = await this.getById(id);
    if (!current) {
      return null;
    }

    if (!isValidOrderStatusTransition(current.status, nextStatus)) {
      throw new ApiError('INVALID_STATUS_TRANSITION', 'Transição de status não permitida.');
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

  private resolveStartKey(cursor: string, filters: CursorFilters): Record<string, string> {
    const decoded = decodeCursor(cursor, filters);
    if (decoded.index !== GSI_STATUS_CREATED_AT) {
      throw new ApiError('INVALID_CURSOR', 'Cursor inválido.');
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
