import { afterEach, describe, expect, it } from 'vitest';
import { getDocClient, getOrdersTableName, getProductsTableName, resetDocClientForTests } from './client';

describe('table env helpers', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
    resetDocClientForTests();
  });

  it('creates doc client singleton', () => {
    resetDocClientForTests();
    const first = getDocClient();
    const second = getDocClient();
    expect(second).toBe(first);
  });

  it('requires PRODUCTS_TABLE', () => {
    delete process.env.PRODUCTS_TABLE;
    expect(() => getProductsTableName()).toThrow('PRODUCTS_TABLE');
  });

  it('returns PRODUCTS_TABLE from env', () => {
    process.env.PRODUCTS_TABLE = 'afro90s-dev-ddb-products';
    expect(getProductsTableName()).toBe('afro90s-dev-ddb-products');
  });

  it('requires ORDERS_TABLE', () => {
    delete process.env.ORDERS_TABLE;
    expect(() => getOrdersTableName()).toThrow('ORDERS_TABLE');
  });
});
