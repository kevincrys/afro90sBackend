import { describe, expect, it } from 'vitest';
import { classifyOrderSearchQuery } from './order-search';

const FULL_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('classifyOrderSearchQuery', () => {
  it.each([
    [FULL_UUID, 'fullUuid'],
    ['550e8400', 'idOnly'],
    ['550e8400-e29b', 'idOnly'],
    ['55', 'idOnly'],
    ['maria', 'nameOnly'],
    ['maria silva', 'nameOnly'],
    ['José', 'nameOnly'],
    ['maria123', 'idOnly'],
    ['dead', 'idOrName'],
    ['ace', 'idOrName'],
    ['dead-beef', 'idOrName'],
  ] as const)('classifies %j as %s', (q, expected) => {
    expect(classifyOrderSearchQuery(q)).toBe(expected);
  });
});
