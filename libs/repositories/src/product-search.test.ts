import { describe, expect, it } from 'vitest';
import { buildProductSearchFilter, classifyProductSearchQuery } from './product-search';

const FULL_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('classifyProductSearchQuery', () => {
  it.each([
    [FULL_UUID, 'fullUuid'],
    ['550e8400', 'idOnly'],
    ['550e8400-e29b', 'idOnly'],
    ['55', 'idOnly'],
    ['maria', 'nameOnly'],
    ['maria silva', 'nameOnly'],
    ['José', 'nameOnly'],
    ['Óculos 90', 'nameOnly'],
    ['produto2', 'nameOnly'],
    ['dead', 'idOrName'],
    ['ace', 'idOrName'],
    ['dead-beef', 'idOrName'],
  ] as const)('classifies %j as %s', (q, expected) => {
    expect(classifyProductSearchQuery(q)).toBe(expected);
  });
});

describe('buildProductSearchFilter', () => {
  const normalize = (value: string) => value.toLowerCase();

  it('builds nameOnly filter on nameLower', () => {
    expect(buildProductSearchFilter('Óculos 90', 'nameOnly', normalize)).toEqual({
      filterExpression: 'begins_with(#nameLower, :prefix)',
      names: { '#nameLower': 'nameLower' },
      values: { ':prefix': 'óculos 90' },
    });
  });

  it('builds idOrName OR filter', () => {
    const filter = buildProductSearchFilter('dead', 'idOrName', normalize);
    expect(filter.filterExpression).toContain('OR');
    expect(filter.names).toMatchObject({ '#id': 'id', '#nameLower': 'nameLower' });
  });
});
