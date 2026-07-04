import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  AdminCreateProductBodySchema,
  AdminUpdateProductBodySchema,
  type AdminCreateProductBody,
  type AdminUpdateProductBody,
} from '@afro90s/models';
import { parseOrThrow, throwValidationError } from '@afro90s/http';
import { isMultipartRequest } from './request';
import { parseMultipart, type MultipartFile } from './multipart';

function parseJsonBody(event: APIGatewayProxyEventV2): unknown {
  if (!event.body) {
    throwValidationError({ body: 'Corpo da requisição é obrigatório.' });
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throwValidationError({ body: 'JSON inválido.' });
  }
}

function parseJsonField(value: string | undefined, field: string): unknown {
  if (value === undefined || value === '') {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    throwValidationError({ [field]: 'JSON inválido.' });
  }
}

function coerceMultipartCreate(fields: Record<string, string>): unknown {
  return {
    name: fields.name,
    description: fields.description,
    price: fields.price !== undefined ? Number(fields.price) : undefined,
    quantity: fields.quantity !== undefined ? Number(fields.quantity) : undefined,
    category: fields.category,
    options: parseJsonField(fields.options, 'options'),
    photos: parseJsonField(fields.photos, 'photos') ?? [],
  };
}

function coerceMultipartUpdate(fields: Record<string, string>): unknown {
  const body: Record<string, unknown> = {};

  if (fields.name !== undefined) body.name = fields.name;
  if (fields.description !== undefined) body.description = fields.description;
  if (fields.price !== undefined) body.price = Number(fields.price);
  if (fields.quantity !== undefined) body.quantity = Number(fields.quantity);
  if (fields.category !== undefined) body.category = fields.category;
  if (fields.options !== undefined) body.options = parseJsonField(fields.options, 'options');
  if (fields.photos !== undefined) body.photos = parseJsonField(fields.photos, 'photos');

  return body;
}

export interface ParsedAdminProductRequest<T> {
  body: T;
  files: Record<string, MultipartFile>;
}

export async function parseAdminCreateBody(
  event: APIGatewayProxyEventV2,
): Promise<ParsedAdminProductRequest<AdminCreateProductBody>> {
  if (isMultipartRequest(event)) {
    const { fields, files } = await parseMultipart(event);
    return {
      body: parseOrThrow(AdminCreateProductBodySchema, coerceMultipartCreate(fields)),
      files,
    };
  }

  return {
    body: parseOrThrow(AdminCreateProductBodySchema, parseJsonBody(event)),
    files: {},
  };
}

export async function parseAdminUpdateBody(
  event: APIGatewayProxyEventV2,
): Promise<ParsedAdminProductRequest<AdminUpdateProductBody>> {
  if (isMultipartRequest(event)) {
    const { fields, files } = await parseMultipart(event);
    return {
      body: parseOrThrow(AdminUpdateProductBodySchema, coerceMultipartUpdate(fields)),
      files,
    };
  }

  return {
    body: parseOrThrow(AdminUpdateProductBodySchema, parseJsonBody(event)),
    files: {},
  };
}
