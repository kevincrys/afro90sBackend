import { raiseApiError, type CreateOrderItemInput, type OrderItem, type Product } from '@afro90s/models';

function itemKey(productId: string, selectedOption?: string): string {
  return `${productId}::${selectedOption ?? ''}`;
}

export function mergeOrderItems(items: CreateOrderItemInput[]): CreateOrderItemInput[] {
  const merged = new Map<string, CreateOrderItemInput>();

  for (const item of items) {
    const key = itemKey(item.productId, item.selectedOption);
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      continue;
    }
    merged.set(key, { ...item });
  }

  return Array.from(merged.values());
}

export function assertProductFound(
  product: Product | null,
  productId: string,
): asserts product is Product {
  if (!product) {
    raiseApiError('NOT_FOUND', 'Produto não encontrado.', { productId });
  }
}

export function validateSelectedOption(product: Product, item: CreateOrderItemInput): void {
  const options = product.options ?? [];

  if (options.length > 0) {
    if (!item.selectedOption) {
      raiseApiError('INVALID_OPTION', 'Opção do produto é obrigatória.', {
        productId: item.productId,
      });
    }
    if (!options.includes(item.selectedOption)) {
      raiseApiError('INVALID_OPTION', 'Opção do produto inválida.', {
        productId: item.productId,
        selectedOption: item.selectedOption,
      });
    }
    return;
  }

  if (item.selectedOption) {
    raiseApiError('INVALID_OPTION', 'Produto não possui opções.', {
      productId: item.productId,
    });
  }
}

export function validateStock(product: Product, item: CreateOrderItemInput): void {
  if (product.quantity < item.quantity) {
    raiseApiError('INSUFFICIENT_STOCK', 'Estoque insuficiente.', {
      productId: item.productId,
      requestedQuantity: String(item.quantity),
      availableQuantity: String(product.quantity),
    });
  }
}

export function validateOrderItem(product: Product, item: CreateOrderItemInput): void {
  validateSelectedOption(product, item);
  validateStock(product, item);
}

export function buildOrderItem(product: Product, item: CreateOrderItemInput): OrderItem {
  return {
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: product.price,
    ...(item.selectedOption ? { selectedOption: item.selectedOption } : {}),
  };
}

/** BRL com 2 casas → centavos inteiros (evita drift de float na soma). */
export function priceToCents(price: number): number {
  return Math.round(price * 100);
}

export function centsToMoney(cents: number): number {
  return cents / 100;
}

export function lineTotalCents(unitPrice: number, quantity: number): number {
  return priceToCents(unitPrice) * quantity;
}

export interface ValidatedOrderItems {
  orderItems: OrderItem[];
  fullPrice: number;
}

export async function buildValidatedOrderItems(
  items: CreateOrderItemInput[],
  getProductById: (productId: string) => Promise<Product | null>,
): Promise<ValidatedOrderItems> {
  const orderItems: OrderItem[] = [];
  let fullPriceCents = 0;

  for (const item of items) {
    const product = await getProductById(item.productId);
    assertProductFound(product, item.productId);
    validateOrderItem(product, item);

    orderItems.push(buildOrderItem(product, item));
    fullPriceCents += lineTotalCents(product.price, item.quantity);
  }

  return {
    orderItems,
    fullPrice: centsToMoney(fullPriceCents),
  };
}
