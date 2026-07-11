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
  raiseApiError,
  ProductSchema,
  normalizeNameLower,
  type Product,
  type UpdateProductInput,
} from '@afro90s/models';
import { decodeCursor, type CursorFilters } from '@afro90s/pagination';
import { buildProductSearchFilter, classifyProductSearchQuery } from './product-search';

const GSI_CREATED_AT = 'gsi-createdAt';
const LIST_INDEX_PRIMARY = 'primary' as const;

export interface ListProductsParams {
  q?: string;
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

function buildSearchFilters(params: ListProductsParams & { q: string }): CursorFilters {
  return {
    q: params.q,
    ...(params.category ? { category: params.category } : {}),
  };
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
    if (params.q !== undefined && params.q.length > 0) {
      return this.listWithSearch({ ...params, q: params.q });
    }

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

  private async listWithSearch(params: ListProductsParams & { q: string }): Promise<ListProductsResult> {
    const mode = classifyProductSearchQuery(params.q);
    if (mode === 'fullUuid') {
      return this.listByFullId(params);
    }
    return this.listBySearchFilter(params, mode);
  }

  private async listByFullId(
    params: ListProductsParams & { q: string },
  ): Promise<ListProductsResult> {
    const filters = buildSearchFilters(params);
    const product = await this.getById(params.q);

    if (!product) {
      return { items: [], index: LIST_INDEX_PRIMARY, filters };
    }

    if (params.category !== undefined && product.category !== params.category) {
      return { items: [], index: LIST_INDEX_PRIMARY, filters };
    }

    return {
      items: [product],
      index: LIST_INDEX_PRIMARY,
      filters,
    };
  }

  private async listBySearchFilter(
    params: ListProductsParams & { q: string },
    mode: Exclude<ReturnType<typeof classifyProductSearchQuery>, 'fullUuid'>,
  ): Promise<ListProductsResult> {
    const base = buildProductSearchFilter(params.q, mode, normalizeNameLower);
    const filters = buildSearchFilters(params);
    const exclusiveStartKey = params.cursor
      ? this.resolveStartKey(params.cursor, filters, LIST_INDEX_PRIMARY)
      : undefined;

    const names = { ...base.names };
    const values = { ...base.values };
    let filterExpression = base.filterExpression;

    if (params.category) {
      names['#category'] = 'category';
      values[':category'] = params.category;
      filterExpression = `(${filterExpression}) AND #category = :category`;
    }

    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        Limit: params.limit,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    return {
      ...this.mapListResult(result.Items, result.LastEvaluatedKey),
      index: LIST_INDEX_PRIMARY,
      filters,
    };
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
    const expressionAttributeValues: Record<string, unknown> = {
      ':delta': delta,
      ':updatedAt': new Date().toISOString(),
    };

    let conditionExpression = 'attribute_exists(id)';
    if (delta < 0) {
      expressionAttributeValues[':minQuantity'] = -delta;
      conditionExpression += ' AND quantity >= :minQuantity';
    }

    try {
      const result = await this.client.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { id },
          UpdateExpression: 'SET quantity = quantity + :delta, updatedAt = :updatedAt',
          ExpressionAttributeValues: expressionAttributeValues,
          ConditionExpression: conditionExpression,
          ReturnValues: 'ALL_NEW',
        }),
      );

      if (!result.Attributes) {
        return null;
      }

      return ProductSchema.parse(result.Attributes);
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        raiseApiError('INSUFFICIENT_STOCK', 'Estoque insuficiente.', {
          productId: id,
          delta: String(delta),
        });
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
      raiseApiError('INVALID_CURSOR', 'Cursor inválido.', {
        reason: 'index_mismatch',
        expectedIndex,
        actualIndex: decoded.index,
      });
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
