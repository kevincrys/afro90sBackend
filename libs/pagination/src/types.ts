import { z } from 'zod';

export const CURSOR_VERSION = 1 as const;

export const CursorIndexSchema = z.enum([
  'primary',
  'gsi-createdAt',
  'gsi-status-createdAt',
]);
export type CursorIndex = z.infer<typeof CursorIndexSchema>;

export const CursorFiltersSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});
export type CursorFilters = z.infer<typeof CursorFiltersSchema>;

export const CursorPayloadSchema = z.object({
  v: z.literal(CURSOR_VERSION),
  index: CursorIndexSchema,
  key: z.record(z.string()),
  filters: CursorFiltersSchema,
});
export type CursorPayload = z.infer<typeof CursorPayloadSchema>;

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}
