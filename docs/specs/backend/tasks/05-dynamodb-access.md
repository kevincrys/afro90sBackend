# Task 05 — Acesso DynamoDB

**Fase:** 0 — Fundação  
**Status:** concluída  
**Arquivos alvo:** [`data-models.md`](../data-models.md), `libs/dynamodb/`, `libs/repositories/`

## Objetivo

Implementar repositórios DynamoDB para `products` e `orders` com queries nos GSIs definidos na infra.

## O que implementar

### `libs/dynamodb/`

- [x] Singleton `DynamoDBDocumentClient` com `removeUndefinedValues: true`
- [x] `PRODUCTS_TABLE`, `ORDERS_TABLE` via env

### `libs/repositories/`

- [x] `ProductRepository` — get, list (Scan tabela / gsi-createdAt), create, update, delete, updateStock
- [x] `OrderRepository` — create, get, list (gsi-status-createdAt ou Scan), updateStatus + TTL terminal
- [x] Busca admin (task 20): `list` com `q` — `Scan`/`Query` + `begins_with(customerNameLower, :prefix)` ou `begins_with(id, :q)`; campo `customerNameLower` gravado no `POST /orders`
- [x] Testes unitários com mock do client

#### `updateStock` (products)

- `UpdateExpression`: `quantity = quantity + :delta`
- `delta < 0`: `ConditionExpression` inclui `quantity >= :minQuantity` (`:minQuantity = -delta`)
- `delta > 0`: condição apenas `attribute_exists(id)`
- Falha de condição → `409 INSUFFICIENT_STOCK` (via `@afro90s/models`)

## Critérios de conclusão

- [x] Repositórios compilam e têm testes unitários com mock
- [x] Queries usam GSIs corretos
- [x] Atualizar **Status** para `concluída`
