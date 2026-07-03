import { ApiError } from '@afro90s/models';

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function parseLimit(raw?: string): number {
  if (raw === undefined || raw === '') {
    return DEFAULT_LIMIT;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
    throw new ApiError('INVALID_QUERY', 'Parâmetro limit inválido.');
  }

  return parsed;
}
