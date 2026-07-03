import type { Product } from '@afro90s/models';

export type PublicProduct = Omit<Product, 'nameLower'>;

export function toPublicProduct(product: Product): PublicProduct {
  const { nameLower, ...publicFields } = product;
  void nameLower;
  return publicFields;
}
