# Task 20 — Busca admin de pedidos (backend)

**Fase:** 3 — Rotas admin (extensão)  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), [`data-models.md`](../data-models.md)

## História de usuário

**Como** administrador autenticado via API  
**Quero** filtrar pedidos por ID ou prefixo do nome do cliente em `GET /admin/orders`  
**Para** localizar pedidos em auditorias sem listar todas as páginas

### Critérios de aceite (API)

| # | Requisição | Resultado esperado |
|---|------------|-------------------|
| 1 | `GET /admin/orders` | Lista paginada, `createdAt` desc |
| 2 | `GET /admin/orders?q=maria` | Pedidos cujo `customerNameLower` começa com `maria` |
| 3 | `GET /admin/orders?q={uuid}` | `GetItem` — 0 ou 1 pedido |
| 4 | `GET /admin/orders?q=550e8400` | Prefixo de ID (≥ 8 hex/hífen) |
| 5 | `GET /admin/orders?status=X&q=Y` | Combina filtros |
| 6 | `GET /admin/orders?q=a` | `400 INVALID_QUERY` |
| 7 | `POST /orders` | Grava `customerNameLower = normalizeNameLower(customer.name)` |
| 8 | `GET /admin/orders*` | Resposta **sem** campo `customerNameLower` |

## Padrão (espelha produtos)

| Produto | Pedido |
|---------|--------|
| `nameLower` (interno) | `customerNameLower` (interno) |
| `normalizeNameLower(name)` na criação | `normalizeNameLower(customer.name)` no `POST /orders` |
| `Scan` + `begins_with(#nameLower, :prefix)` | `Scan`/`Query` + `begins_with(#customerNameLower, :prefix)` |
| Omitido via `toPublicProduct()` | Omitido via `toPublicOrder()` |

## Implementação

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `libs/models/src/order.ts` | `customerNameLower?: string` no `OrderSchema` |
| `resources/orders-public/src/services/order.service.ts` | Grava `customerNameLower` ao criar |
| `libs/repositories/src/order.mapper.ts` | `toPublicOrder()` omite campo interno |
| `libs/repositories/src/order.repository.ts` | `list({ q })` — UUID / prefixo ID / nome |
| `libs/pagination/src/types.ts` | `q` em `CursorFiltersSchema` |
| `resources/orders-admin/src/routes/get-admin-orders.ts` | Parse `query.q`, map `toPublicOrder` |
| `resources/orders-admin/src/routes/get-admin-order-by-id.ts` | `toPublicOrder` |
| `resources/orders-admin/src/routes/put-admin-order.ts` | `toPublicOrder` |

### Modelo e criação

- [x] `OrderSchema`: `customerNameLower?: string` (optional para pedidos legados)
- [x] `POST /orders`: gravar `customerNameLower` ao criar pedido

### `GET /admin/orders`

- [x] Query param `q` (mín. 2 chars; `400 INVALID_QUERY` se curto)
- [x] Detecção: UUID completo → `GetItem`; prefixo UUID (≥ 8 hex/hífen) → `begins_with(id)`; senão → busca por nome via `customerNameLower`
- [x] Combina com `status` e paginação por cursor (`q` em `filters` do cursor)
- [x] Ordenação: `createdAt` desc (inalterada)
- [x] Resposta omita `customerNameLower` (`toPublicOrder`)

### Repositório

- [x] `OrderRepository.list({ q?, status?, cursor, limit })`
- [x] `listByCustomerName` — espelha `ProductRepository.listByName`

### Testes

- [x] Unitários: `order.repository.test.ts`, `order.mapper.test.ts`, `order.service.test.ts`, `handler.test.ts`
- [x] Smoke E2E: `scripts/smoke-test-api-fase3.sh` — busca por nome, por ID, `q` curto → 400

## Fora de escopo

- Backfill de pedidos legados
- Novo GSI DynamoDB

## Pré-requisitos

- Task 14 concluída

## Critérios de conclusão

- [x] Busca funcional em dev
- [x] `npm test` — 248 testes passando
- [x] Smoke fase 3 cobre busca com token admin
- [x] Atualizar **Status** para `concluída`
