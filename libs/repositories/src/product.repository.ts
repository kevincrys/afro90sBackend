import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { getDocClient, getProductsTableName } from '@afro90s/dynamodb';
import {
  ApiError,
  ProductSchema,
  normalizeNameLower,
  type Product,
  type UpdateProductInput,
} from '@afro90s/models';
import { decodeCursor, type CursorFilters } from '@afro90s/pagination';

const GSI_CREATED_AT = 'gsi-createdAt';
const LIST_INDEX_PRIMARY = 'primary' as const;

export interface ListProductsParams {
  name?: string;
  category?: string;
  cursor?: string;
  limit: number;
}

export interface ListProductsResult {
  items: Product[];
  lastEvaluatedKey?: Record<string, string>;
  index: typeof LIST_INDEX_PRIMARY | typeof GSI_CREATED_AT;
  filters: CursorFilters;
}

export class ProductRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient = getDocClient(),
    private readonly tableName: string = getProductsTableName(),
  ) {}

  async getById(id: string): Promise<Product | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    if (!result.Item) {
      return null;
    }

    return ProductSchema.parse(result.Item);
  }

  async list(params: ListProductsParams): Promise<ListProductsResult> {
    const filters: CursorFilters = {
      ...(params.name ? { name: params.name } : {}),
      ...(params.category ? { category: params.category } : {}),
    };
    const index = params.name ? LIST_INDEX_PRIMARY : GSI_CREATED_AT;
    const exclusiveStartKey = params.cursor
      ? this.resolveStartKey(params.cursor, filters, index)
      : undefined;

    const result = params.name
      ? await this.listByName({
          name: params.name,
          category: params.category,
          limit: params.limit,
          exclusiveStartKey,
        })
      : await this.listByCreatedAt({
          category: params.category,
          limit: params.limit,
          exclusiveStartKey,
        });

    return { ...result, index, filters };
  }

  async create(product: Product): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: product,
      }),
    );
  }

  async update(id: string, fields: UpdateProductInput): Promise<Product | null> {
    const entries = Object.entries({
      ...fields,
      updatedAt: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined);
    if (entries.length === 0) {
      return this.getById(id);
    }

    const names: Record<string, string> = {};
    const values: Record<string, unknown> = {};
    const setParts: string[] = [];

    for (const [key, value] of entries) {
      names[`#${key}`] = key;
      values[`:${key}`] = value;
      setParts.push(`#${key} = :${key}`);
    }

    if (fields.name) {
      names['#nameLower'] = 'nameLower';
      values[':nameLower'] = normalizeNameLower(fields.name);
      setParts.push('#nameLower = :nameLower');
    }

    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${setParts.join(', ')}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    );

    if (!result.Attributes) {
      return null;
    }

    return ProductSchema.parse(result.Attributes);
  }

  async delete(id: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );
  }

  async updateStock(id: string, delta: number): Promise<Product | null> {
    try {
      const result = await this.client.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { id },
          UpdateExpression: 'SET quantity = quantity + :delta, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':delta': delta,
            ':updatedAt': new Date().toISOString(),
            ':zero': 0,
          },
          ConditionExpression: 'attribute_exists(id) AND quantity + :delta >= :zero',
          ReturnValues: 'ALL_NEW',
        }),
      );

      if (!result.Attributes) {
        return null;
      }

      return ProductSchema.parse(result.Attributes);
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        throw new ApiError('INSUFFICIENT_STOCK', 'Estoque insuficiente.');
      }
      throw error;
    }
  }

  private resolveStartKey(
    cursor: string,
    filters: CursorFilters,
    expectedIndex: typeof LIST_INDEX_PRIMARY | typeof GSI_CREATED_AT,
  ): Record<string, string> {
    const decoded = decodeCursor(cursor, filters);
    if (decoded.index !== expectedIndex) {
      throw new ApiError('INVALID_CURSOR', 'Cursor inválido.');
    }
    return decoded.key;
  }

  private async listByName(params: {
    name: string;
    category?: string;
    limit: number;
    exclusiveStartKey?: Record<string, string>;
  }): Promise<{ items: Product[]; lastEvaluatedKey?: Record<string, string> }> {
    const prefix = normalizeNameLower(params.name);
    const names: Record<string, string> = { '#nameLower': 'nameLower' };
    const values: Record<string, string> = { ':prefix': prefix };
    const filterParts = ['begins_with(#nameLower, :prefix)'];

    if (params.category) {
      names['#category'] = 'category';
      values[':category'] = params.category;
      filterParts.push('#category = :category');
    }

    // Busca por prefixo: Scan na tabela base (nameLower é atributo, não GSI).
    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: filterParts.join(' AND '),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        Limit: params.limit,
        ExclusiveStartKey: params.exclusiveStartKey,
      }),
    );

    return this.mapListResult(result.Items, result.LastEvaluatedKey);
  }

  private async listByCreatedAt(params: {
    category?: string;
    limit: number;
    exclusiveStartKey?: Record<string, string>;
  }): Promise<{ items: Product[]; lastEvaluatedKey?: Record<string, string> }> {
    const values: Record<string, string> = {};
    let filterExpression: string | undefined;

    if (params.category) {
      filterExpression = 'category = :category';
      values[':category'] = params.category;
    }

    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        IndexName: GSI_CREATED_AT,
        ...(filterExpression
          ? { FilterExpression: filterExpression, ExpressionAttributeValues: values }
          : {}),
        Limit: params.limit,
        ExclusiveStartKey: params.exclusiveStartKey,
      }),
    );

    return this.mapListResult(result.Items, result.LastEvaluatedKey);
  }

  private mapListResult(
    items: Record<string, unknown>[] | undefined,
    lastEvaluatedKey: Record<string, unknown> | undefined,
  ): { items: Product[]; lastEvaluatedKey?: Record<string, string> } {
    return {
      items: (items ?? []).map((item) => ProductSchema.parse(item)),
      lastEvaluatedKey: lastEvaluatedKey as Record<string, string> | undefined,
    };
  }
}

let defaultRepository: ProductRepository | undefined;

export function getProductRepository(): ProductRepository {
  if (!defaultRepository) {
    defaultRepository = new ProductRepository();
  }
  return defaultRepository;
}
