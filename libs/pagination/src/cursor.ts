import { ApiError } from '@afro90s/models';
import {
  CURSOR_VERSION,
  CursorPayloadSchema,
  type CursorFilters,
  type CursorPayload,
} from './types';

export function normalizeCursorFilters(filters: CursorFilters): CursorFilters {
  const normalized: CursorFilters = {};
  if (filters.name) normalized.name = filters.name;
  if (filters.category) normalized.category = filters.category;
  if (filters.status) normalized.status = filters.status;
  return normalized;
}

export function filtersMatch(a: CursorFilters, b: CursorFilters): boolean {
  return (
    JSON.stringify(normalizeCursorFilters(a)) === JSON.stringify(normalizeCursorFilters(b))
  );
}

export function encodeCursor(payload: CursorPayload): string {
  const body = JSON.stringify({
    ...payload,
    v: CURSOR_VERSION,
    filters: normalizeCursorFilters(payload.filters),
  });
  return Buffer.from(body, 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string, expectedFilters: CursorFilters): CursorPayload {
  let parsed: unknown;

  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8');
    parsed = JSON.parse(json);
  } catch {
    throw new ApiError('INVALID_CURSOR', 'Cursor inválido.');
  }

  const result = CursorPayloadSchema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError('INVALID_CURSOR', 'Cursor inválido.');
  }

  if (!filtersMatch(result.data.filters, expectedFilters)) {
    throw new ApiError('INVALID_CURSOR', 'Cursor incompatível com os filtros atuais.');
  }

  return result.data;
}

export function parseExclusiveStartKey(
  cursor: string | undefined,
  expectedFilters: CursorFilters,
): Record<string, string> | undefined {
  if (!cursor) {
    return undefined;
  }
  return decodeCursor(cursor, expectedFilters).key;
}
