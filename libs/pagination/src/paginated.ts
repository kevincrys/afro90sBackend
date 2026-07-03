import { encodeCursor, normalizeCursorFilters } from './cursor';
import type { CursorFilters, CursorIndex, PaginatedResponse } from './types';

export function buildPaginatedResponse<T>(
  items: T[],
  lastEvaluatedKey: Record<string, string> | undefined,
  meta: { index: CursorIndex; filters: CursorFilters },
): PaginatedResponse<T> {
  const hasMore = lastEvaluatedKey !== undefined;
  const filters = normalizeCursorFilters(meta.filters);

  if (!hasMore) {
    return { items, hasMore: false };
  }

  return {
    items,
    hasMore: true,
    nextCursor: encodeCursor({
      v: 1,
      index: meta.index,
      key: lastEvaluatedKey,
      filters,
    }),
  };
}
