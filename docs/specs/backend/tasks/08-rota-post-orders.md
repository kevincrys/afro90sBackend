# Task 08 — Rota `POST /orders`

**Fase:** 1 — API pública (sem e-mail)  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar criação de pedido. Na fase 1 grava no DynamoDB **sem enviar e-mail** (`SES_ENABLED=false`).

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| `fullPrice` | Calculado no servidor |
| `unitPrice` | Snapshot de `Product.price` |
| Itens duplicados | Merge automático de quantidades |
| Estoque `quantity=0` | `409 INSUFFICIENT_STOCK` |
| Status inicial | `SOLICITADO` |
| Decrementar estoque | Não na v1 |
| Resposta `201` | Subset: `{ id, status, fullPrice }` |
| SES falha (fase 4) | `201` + log (não rollback) |
| Idempotência | Fora de escopo v1 |

## O que implementar

### `src/routes/orders.ts`

- [ ] Handler `POST /orders`
- [ ] Validar body com `CreateOrderSchema`
- [ ] Fluxo:
  1. Validar e merge itens duplicados
  2. Buscar cada produto → `404` se não existir
  3. Validar estoque → `409` se `quantity < requested`
  4. Calcular `fullPrice` e `unitPrice` snapshot
  5. Gravar order com status `SOLICITADO`
  6. Se `SES_ENABLED === 'true'`: chamar `emailService` (fase 4)
  7. Retornar `201` com subset

### `src/services/order.service.ts`

- [ ] `createOrder(input)` — orquestra validação + persistência + e-mail condicional

### `src/services/email.service.ts` (stub fase 1)

- [ ] `sendOrderNotification(order)` — no-op se `SES_ENABLED=false`; log `"SES disabled, skipping email"`

### Testes

- [ ] Pedido válido → `201`
- [ ] Produto inexistente → `404`
- [ ] Estoque insuficiente → `409`
- [ ] Body inválido → `400 VALIDATION_ERROR`
- [ ] `fullPrice` calculado corretamente no servidor

## Pré-requisitos

- Tasks 00–07 concluídas
- Infra fase 1 (API pública) deployada

## Critérios de conclusão

- [ ] `POST /orders` retorna `201` em dev (sem e-mail)
- [ ] Pedido visível no DynamoDB
- [ ] Testes com cobertura do fluxo principal
- [ ] Atualizar **Status** para `concluída`
