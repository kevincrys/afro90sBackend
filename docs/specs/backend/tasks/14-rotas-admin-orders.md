# Task 14 — Rotas admin de pedidos

**Fase:** 3 — Rotas admin  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar listagem e atualização de status de pedidos nas rotas `/admin/orders*`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Transições de status | `SOLICITADO→CONFIRMADO→ENVIADO→ENTREGUE` / qualquer→`CANCELADO` |
| Pular estados | Não permitido |
| Ordenação default | Mais recentes primeiro (`createdAt` desc) |

| Mutação de pedido | Apenas `PUT /admin/orders/{id}` com body `{ "status": "..." }` |

## O que implementar

### `resources/orders-admin/`

- [x] `GET /admin/orders` — listagem com `status?`, `cursor`, `limit`
- [x] `GET /admin/orders/{id}` — detalhe completo com `customer`, `items`
- [x] `PUT /admin/orders/{id}` — atualizar status

Todas com middleware auth.

### `resources/orders-admin/src/services/order.service.ts`

- [x] `listOrders(filters)` — query em `gsi-status-createdAt` ou scan sem filtro
- [x] `getOrder(id)`
- [x] `updateOrderStatus(id, newStatus)` — validar transição; `409 INVALID_STATUS_TRANSITION` se inválida
- [x] Ao transicionar para `CONCLUIDO` ou `CANCELADO`: definir `expiresAt` (epoch segundos) = agora + **180 dias**

### Testes

- [x] Listagem com filtro `status`
- [x] Transição válida → `200`
- [x] Transição inválida → `409`
- [x] Transição para `CONCLUIDO`/`CANCELADO` grava `expiresAt` (+180 dias)
- [x] Pedido inexistente → `404`

## Pré-requisitos

- Task 13 concluída

## Critérios de conclusão

- [x] 3 rotas admin de pedidos funcionais em dev
- [x] Transições de status validadas
- [x] Atualizar **Status** para `concluída`
