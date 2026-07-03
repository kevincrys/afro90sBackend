# Task 02 — Modelos de dados (Product, Order, Customer)

**Fase:** 0 — Fundação  
**Status:** concluída  
**Arquivos alvo:** [`data-models.md`](../data-models.md), `libs/models/`

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
| `category` | Enum lowercase; sem acentos (`oculos`, `acessorios`, `maquiagem`) |
| `nameLower` | `normalizeNameLower(name)` — lowercase + remove acentos |
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

### `libs/models/src/product.ts`

- [x] `CategoryEnum`, `ProductSchema`, `CreateProductSchema`, `UpdateProductSchema`
- [x] Refinar `options`: rejeitar duplicatas case-insensitive no create/update
- [x] `normalizeNameLower(name)` em `libs/models/src/normalize.ts`

### `libs/models/src/order.ts`

- [x] `OrderStatusEnum`, `OrderItemSchema`, `CustomerSchema`, `OrderSchema`, `CreateOrderSchema`
- [x] `isValidOrderStatusTransition()` — transições conforme `data-models.md`
- [x] Validação de `selectedOption` contra `product.options` em runtime (task 08), não só no Zod

### `libs/models/src/errors.ts`

- [x] Ver task 03 (`ApiError`, `ApiErrorCode`)

## Pré-requisitos

- Task 00 concluída

## Critérios de conclusão

- [x] Schemas Zod compilam sem erros
- [x] `normalizeNameLower('Óculos Sol')` → `'oculos sol'`
- [x] Testes unitários para validação de `CreateOrderSchema` e `CreateProductSchema`
- [x] `data-models.md` atualizado com schemas e regras
- [x] Atualizar **Status** para `concluída`
