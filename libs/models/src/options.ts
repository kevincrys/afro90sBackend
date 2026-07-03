import { z, type RefinementCtx } from 'zod';

export const ProductOptionSchema = z.string().trim().min(1).max(40);

export function refineUniqueOptions(
  options: string[] | undefined,
  ctx: RefinementCtx,
  path: (string | number)[] = ['options'],
): void {
  if (!options?.length) {
    return;
  }

  const seen = new Set<string>();
  for (const option of options) {
    const key = option.toLowerCase();
    if (seen.has(key)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Duplicate options are not allowed',
        path,
      });
      return;
    }
    seen.add(key);
  }
}
