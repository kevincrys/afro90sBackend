# Task 02 — Modelos de dados (Product, Order, Customer)

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`data-models.md`](../data-models.md)

## Objetivo

Implementar schemas Zod e tipos TypeScript para `Product`, `Order`, `Customer` e enums.

## Configurações já definidas

| Campo | Regra |
|-------|-------|
| `price` | Decimal BRL (`49.90`), 2 casas, arredondamento half-up |
| `name` | 2–120 caracteres |
| `description` | 0–2000 caracteres; default `""`; admin only |
| `options` | 0–5 strings; cada 1–40 chars; sem duplicatas (case-insensitive) |
| `quantity` | 0–99999; default 0 na criação |
| `category` | Enum lowercase; sem acentos |
| `nameLower` | `name.toLowerCase()` normalizado (remove acentos) |
| `fullPrice` | Calculado no servidor: `sum(item.quantity × item.unitPrice)` |
| `unitPrice` | Snapshot de `Product.price` no momento do pedido |
| `customer.name` | 2–200 caracteres |
| `customer.postalCode` | Só dígitos (8 chars) |
| `customer.tel` | Só dígitos (10–11 chars) |
| `customer.address` | 2–200 caracteres |
| Itens por pedido | Máximo 99 |
| Quantidade por item | Máximo 99 |
| Produto `quantity=0` | Visível no catálogo com overlay "Esgotado" |
| Mesmo `(productId, selectedOption)` duas vezes | Merge automático das quantidades |
| `selectedOption` | Obrigatório se `product.options.length > 0`; deve ∈ `product.options` |

## O que implementar

### `src/models/product.ts`

```typescript
export const CategoryEnum = z.enum(['camiseta','bone','acessorio','disco','outro']);
export type Category = z.infer<typeof CategoryEnum>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(120),
  nameLower: z.string(),
  description: z.string().max(2000),
  price: z.number().positive().multipleOf(0.01),
  quantity: z.number().int().min(0).max(99999),
  photos: z.array(z.string().url()),
  category: CategoryEnum,
  options: z.array(z.string().trim().min(1).max(40)).max(5).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Product = z.infer<typeof ProductSchema>;

export const CreateProductSchema = ProductSchema.omit({ id:true, nameLower:true, createdAt:true, updatedAt:true })
  .extend({ description: z.string().max(2000).default('') });
export const UpdateProductSchema = CreateProductSchema.partial();
```

- [ ] Refinar `options`: rejeitar duplicatas case-insensitive no create/update

- [ ] Implementar função `normalizeNameLower(name: string): string` (lowercase + remove acentos com `normalize('NFD')`)

### `src/models/order.ts`

```typescript
export const OrderStatusEnum = z.enum(['SOLICITADO','CONFIRMADO','ENVIADO','ENTREGUE','CANCELADO']);

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  unitPrice: z.number().positive(),
  selectedOption: z.string().trim().min(1).max(40).optional(),
});

export const CustomerSchema = z.object({
  name: z.string().min(2).max(200),
  address: z.string().min(2).max(200),
  postalCode: z.string().regex(/^\d{8}$/),
  tel: z.string().regex(/^\d{10,11}$/),
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  status: OrderStatusEnum,
  items: z.array(OrderItemSchema).min(1).max(99),
  fullPrice: z.number().positive(),
  customer: CustomerSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateOrderSchema = z.object({
  customer: CustomerSchema,
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
    selectedOption: z.string().trim().min(1).max(40).optional(),
  })).min(1).max(99),
});
```

- [ ] Validar `selectedOption` contra `product.options` em runtime (task 08), não só no Zod

- [ ] Transições de status válidas: `SOLICITADO→CONFIRMADO→ENVIADO→ENTREGUE` / qualquer→`CANCELADO`

### `src/models/errors.ts`

- [ ] Ver task 03

## Pré-requisitos

- Task 00 concluída

## Critérios de conclusão

- [ ] Schemas Zod compilam sem erros
- [ ] `normalizeNameLower('Óculos Sol')` → `'oculos sol'`
- [ ] Testes unitários para validação de `CreateOrderSchema` e `CreateProductSchema`
- [ ] `data-models.md` atualizado com schemas e regras
- [ ] Atualizar **Status** para `concluída`
