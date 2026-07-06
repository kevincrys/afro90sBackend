# Task 21 — Nome do produto em OrderItem (backend)

**Fase:** 3 — Rotas admin (extensão)  
**Status:** concluída  
**Arquivos alvo:** [`data-models.md`](../data-models.md), [`api-routes.md`](../api-routes.md)

## Objetivo

Persistir snapshot de `Product.name` como `productName` em cada `OrderItem` na criação do pedido (`POST /orders`), para exibição na admin e no WhatsApp sem join com catálogo.

## Configurações já definidas

| Campo | Regra |
|-------|-------|
| `productName` | Snapshot de `Product.name` no `POST /orders`; **não** enviado pelo cliente |
| Validação | 2–120 caracteres (igual `Product.name`) |
| Legado | Opcional no `OrderItemSchema`; pedidos novos sempre preenchidos |
| Rotas admin | Sem mudança de contrato — `GET /admin/orders*` retorna o campo em `items[]` |

## O que implementar

### Modelo

- [x] `OrderItemSchema`: adicionar `productName?: string` (optional para legado)
- [x] `CreateOrderItemSchema` inalterado (cliente não envia nome)

### Snapshot na criação

- [x] `buildOrderItem` em `order.validation.ts`: incluir `productName: product.name`
- [x] Novos pedidos persistem o campo no DynamoDB

### Testes

- [x] `order.validation.test.ts` — assert `productName` no snapshot
- [x] `order.service.test.ts` — assert `productName` no pedido persistido

## Fora de escopo

- Backfill de pedidos antigos
- Mudança em rotas admin (já retornam `items` completos)
- Infra / GSI / migração DynamoDB

## Pré-requisitos

- Task 08 (`POST /orders`) concluída

## Critérios de conclusão

- [x] Novo pedido grava `productName` em cada item
- [x] Pedidos legados sem campo continuam parseando
- [x] Testes passando (248)
- [x] Specs atualizadas (`data-models.md`, `api-routes.md`)
- [x] Atualizar **Status** para `concluída`
