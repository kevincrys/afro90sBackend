# Task 08 — Rota `POST /orders`

**Fase:** 1 — API pública (sem e-mail)  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), `resources/orders-public/`

## Objetivo

Implementar criação de pedido. Na fase 1 grava no DynamoDB **sem enviar e-mail** (`SES_ENABLED=false`).

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| `fullPrice` | Calculado no servidor (soma em centavos inteiros; ver `data-models.md`) |
| `unitPrice` | Snapshot de `Product.price` |
| Itens duplicados | Merge por `(productId, selectedOption)` |
| `selectedOption` | Obrigatório se produto tem `options`; validar ∈ `product.options` |
| Estoque `quantity=0` | `409 INSUFFICIENT_STOCK` |
| Status inicial | `SOLICITADO` |
| Decrementar estoque | Não na v1 |
| Resposta `201` | Subset: `{ id, status, fullPrice }` |
| SES falha (fase 4) | `201` + log (não rollback) |
| Idempotência | Fora de escopo v1 |

## O que implementar

### `resources/orders-public/src/routes/post-orders.ts`

- [x] Handler `POST /orders`
- [x] Validar body com `CreateOrderSchema`
- [x] Fluxo via `order.service.createOrder`

### `resources/orders-public/src/services/order.service.ts`

- [x] `createOrder(input)` — orquestra validação + persistência + e-mail condicional

### `resources/orders-public/src/services/email.service.ts` (stub fase 1)

- [x] `sendOrderNotification(order)` — no-op se `SES_ENABLED=false`; log `"SES disabled, skipping email"`

### Testes

- [x] Pedido válido → `201`
- [x] Produto inexistente → `404`
- [x] Estoque insuficiente → `409`
- [x] Body inválido → `400 VALIDATION_ERROR`
- [x] Opção ausente ou inválida → `400 INVALID_OPTION`
- [x] Merge `(productId, selectedOption)` soma quantidades
- [x] `fullPrice` calculado corretamente no servidor

## Pré-requisitos

- Tasks 00–07 concluídas

## Critérios de conclusão

- [x] Handler e serviços implementados com testes
- [x] Atualizar **Status** para `concluída`
