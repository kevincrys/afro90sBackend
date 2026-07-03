# Task 14 — Rotas admin de pedidos

**Fase:** 3 — Rotas admin  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar listagem e atualização de status de pedidos nas rotas `/admin/orders*`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Transições de status | `SOLICITADO→CONFIRMADO→ENVIADO→ENTREGUE` / qualquer→`CANCELADO` |
| Pular estados | Não permitido |
| Ordenação default | Mais recentes primeiro (`createdAt` desc) |

## O que implementar

### `src/routes/admin/orders.ts`

- [ ] `GET /admin/orders` — listagem com `status?`, `cursor`, `limit`
- [ ] `GET /admin/orders/{id}` — detalhe completo com `customer`, `items` (incl. `selectedOption` por item)
- [ ] `PUT /admin/orders/{id}` — atualizar status

Todas com middleware auth.

### `src/services/order.service.ts` (expandir)

- [ ] `listOrders(filters)` — query em `gsi-status-createdAt`
- [ ] `getOrder(id)`
- [ ] `updateOrderStatus(id, newStatus)` — validar transição; `409 INVALID_STATUS_TRANSITION` se inválida
- [ ] Ao transicionar para `CONCLUIDO` ou `CANCELADO`: definir `expiresAt` (epoch segundos) = agora + **180 dias**

### Testes

- [ ] Listagem com filtro `status`
- [ ] Transição válida → `200`
- [ ] Transição inválida → `409`
- [ ] Transição para `CONCLUIDO`/`CANCELADO` grava `expiresAt` (+180 dias)
- [ ] Pedido inexistente → `404`

## Pré-requisitos

- Task 13 concluída

## Critérios de conclusão

- [ ] 3 rotas admin de pedidos funcionais em dev
- [ ] Transições de status validadas
- [ ] Atualizar **Status** para `concluída`
