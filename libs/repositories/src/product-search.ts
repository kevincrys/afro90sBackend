import { z } from 'zod';

export type ProductSearchMode = 'fullUuid' | 'idOnly' | 'nameOnly' | 'idOrName';

const HEX_TOKEN_PATTERN = /^[0-9a-f-]+$/i;

function isFullUuid(value: string): boolean {
  return z.string().uuid().safeParse(value).success;
}

function isHexToken(value: string): boolean {
  return HEX_TOKEN_PATTERN.test(value.replace(/-/g, ''));
}

function hasDigit(value: string): boolean {
  return /[0-9]/.test(value);
}

/**
 * Unlike orders (customer names forbid digits), product names may include digits
 * (e.g. "Óculos 90"). Only treat as ID when the token is hex/hyphen shaped.
 */
export function classifyProductSearchQuery(q: string): ProductSearchMode {
  if (isFullUuid(q)) {
    return 'fullUuid';
  }

  if (isHexToken(q)) {
    return hasDigit(q) ? 'idOnly' : 'idOrName';
  }

  return 'nameOnly';
}

export interface ProductSearchFilter {
  filterExpression: string;
  names: Record<string, string>;
  values: Record<string, string>;
}

export function buildProductSearchFilter(
  q: string,
  mode: Exclude<ProductSearchMode, 'fullUuid'>,
  normalizeNameLower: (value: string) => string,
): ProductSearchFilter {
  switch (mode) {
    case 'idOnly':
      return {
        filterExpression: 'begins_with(#id, :qLower)',
        names: { '#id': 'id' },
        values: { ':qLower': q.toLowerCase() },
      };
    case 'nameOnly':
      return {
        filterExpression: 'begins_with(#nameLower, :prefix)',
        names: { '#nameLower': 'nameLower' },
        values: { ':prefix': normalizeNameLower(q) },
      };
    case 'idOrName':
      return {
        filterExpression: '(begins_with(#id, :qLower) OR begins_with(#nameLower, :prefix))',
        names: {
          '#id': 'id',
          '#nameLower': 'nameLower',
        },
        values: {
          ':qLower': q.toLowerCase(),
          ':prefix': normalizeNameLower(q),
        },
      };
  }
}
