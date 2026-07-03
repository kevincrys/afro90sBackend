import { describe, expect, it } from 'vitest';
import { ApiError } from '@afro90s/models';
import { decodeCursor, encodeCursor, parseExclusiveStartKey } from './cursor';
import { buildPaginatedResponse } from './paginated';
import { parseLimit } from './limit';

describe('cursor', () => {
  const filters = { category: 'oculos' };
  const payload = {
    v: 1 as const,
    index: 'gsi-name' as const,
    key: { nameLower: 'oculos', id: '550e8400-e29b-41d4-a716-446655440000' },
    filters,
  };

  it('round-trips encode/decode', () => {
    const cursor = encodeCursor(payload);
    expect(decodeCursor(cursor, filters)).toEqual(payload);
  });

  it('throws INVALID_CURSOR for corrupted cursor', () => {
    expect(() => decodeCursor('not-valid!!!', filters)).toThrow(ApiError);
  });

  it('throws on invalid payload shape', () => {
    const cursor = Buffer.from(JSON.stringify({ v: 2 }), 'utf8').toString('base64url');
    expect(() => decodeCursor(cursor, filters)).toThrow(ApiError);
  });

  it('throws when filters do not match', () => {
    const cursor = encodeCursor(payload);
    expect(() => decodeCursor(cursor, { category: 'maquiagem' })).toThrow(ApiError);
  });

  it('parseExclusiveStartKey returns undefined without cursor', () => {
    expect(parseExclusiveStartKey(undefined, {})).toBeUndefined();
  });

  it('parseExclusiveStartKey returns DynamoDB key', () => {
    const cursor = encodeCursor(payload);
    expect(parseExclusiveStartKey(cursor, filters)?.id).toBe(payload.key.id);
  });
});

describe('parseLimit', () => {
  it('defaults to 20', () => {
    expect(parseLimit()).toBe(20);
    expect(parseLimit('')).toBe(20);
  });

  it('parses valid limit', () => {
    expect(parseLimit('50')).toBe(50);
  });

  it('rejects limit above 100', () => {
    expect(() => parseLimit('101')).toThrow(ApiError);
  });
});

describe('buildPaginatedResponse', () => {
  it('returns hasMore false without last key', () => {
    expect(buildPaginatedResponse([{ id: '1' }], undefined, { index: 'gsi-name', filters: {} })).toEqual({
      items: [{ id: '1' }],
      hasMore: false,
    });
  });

  it('returns nextCursor when more pages exist', () => {
    const page = buildPaginatedResponse(
      [{ id: '1' }],
      { id: '1' },
      { index: 'gsi-createdAt', filters: {} },
    );
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBeDefined();
  });
});
