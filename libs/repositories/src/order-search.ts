import { z } from 'zod';

export type OrderSearchMode = 'fullUuid' | 'idOnly' | 'nameOnly' | 'idOrName';

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

export function classifyOrderSearchQuery(q: string): OrderSearchMode {
  if (isFullUuid(q)) {
    return 'fullUuid';
  }

  if (hasDigit(q)) {
    return 'idOnly';
  }

  if (!isHexToken(q)) {
    return 'nameOnly';
  }

  return 'idOrName';
}

export interface OrderSearchFilter {
  filterExpression: string;
  names: Record<string, string>;
  values: Record<string, string>;
}

export function buildOrderSearchFilter(
  q: string,
  mode: Exclude<OrderSearchMode, 'fullUuid'>,
  normalizeNameLower: (value: string) => string,
): OrderSearchFilter {
  switch (mode) {
    case 'idOnly':
      return {
        filterExpression: 'begins_with(#id, :qLower)',
        names: { '#id': 'id' },
        values: { ':qLower': q.toLowerCase() },
      };
    case 'nameOnly':
      return {
        filterExpression: 'begins_with(#customerNameLower, :prefix)',
        names: { '#customerNameLower': 'customerNameLower' },
        values: { ':prefix': normalizeNameLower(q) },
      };
    case 'idOrName':
      return {
        filterExpression:
          '(begins_with(#id, :qLower) OR begins_with(#customerNameLower, :prefix))',
        names: {
          '#id': 'id',
          '#customerNameLower': 'customerNameLower',
        },
        values: {
          ':qLower': q.toLowerCase(),
          ':prefix': normalizeNameLower(q),
        },
      };
  }
}
