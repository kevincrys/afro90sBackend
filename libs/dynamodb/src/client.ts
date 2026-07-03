import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let docClient: DynamoDBDocumentClient | undefined;

export function getDocClient(): DynamoDBDocumentClient {
  if (!docClient) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
    });
    docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return docClient;
}

/** @internal test helper */
export function resetDocClientForTests(): void {
  docClient = undefined;
}

export function getProductsTableName(): string {
  const name = process.env.PRODUCTS_TABLE;
  if (!name) {
    throw new Error('PRODUCTS_TABLE env var is required');
  }
  return name;
}

export function getOrdersTableName(): string {
  const name = process.env.ORDERS_TABLE;
  if (!name) {
    throw new Error('ORDERS_TABLE env var is required');
  }
  return name;
}
