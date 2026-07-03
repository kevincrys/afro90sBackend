import { describe, expect, it } from 'vitest';
import { normalizeNameLower } from './normalize';

describe('normalizeNameLower', () => {
  it('lowercases and removes accents', () => {
    expect(normalizeNameLower('Óculos Sol')).toBe('oculos sol');
  });

  it('trims whitespace', () => {
    expect(normalizeNameLower('  Boné  ')).toBe('bone');
  });
});
