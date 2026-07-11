# Task 16 — E-mail SES (notificação de pedido)

**Fase:** 4 — Email  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), [`overview.md`](../overview.md), `resources/orders-public/src/services/email.service.ts`

## Objetivo

Implementar envio de e-mail via SES no `POST /orders`. Ativa quando `SES_ENABLED=true`. Destinatário: **admin** (v1).

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Destinatário | `ADMIN_EMAIL` (SSM / env Lambda — secret no deploy infra) |
| Remetente | `SES_FROM_EMAIL` |
| Template | `SES_TEMPLATE_NAME` = `afro90s-{env}-ses-new-order` |
| Variáveis template | `orderId`, `customerName`, `itemsSummary` (com preços), `fullPrice` |
| Falha SES após gravar | `201` + log (sem rollback) |

## O que implementar

- [x] `SESClient` singleton + `SendTemplatedEmail`
- [x] `sendOrderNotification(order)` — no-op se `SES_ENABLED !== 'true'`; falha só loga
- [x] Integrado em `order.service.ts` após `PutItem`
- [x] Testes: disabled / enabled / falha SES

## Pré-requisitos

- Infra task 18 (SES) deployada com identidade verificada + secrets

## Critérios de conclusão

- [x] Código + testes
- [x] Falha SES não impede `201`
- [x] Atualizar **Status** para `concluída`
