# Task 16 — E-mail SES (notificação de pedido)

**Fase:** 4 — Email  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), [`overview.md`](../overview.md)

## Objetivo

Implementar envio de e-mail via SES no `POST /orders`. Ativa quando `SES_ENABLED=true`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Destinatário | `ADMIN_EMAIL` (SSM) |
| Remetente | `SES_FROM_EMAIL` (SSM) |
| Assunto | `[Afro90s] Pedido em preparação` |
| Corpo | HTML via template SES |
| Variáveis template | `orderId`, `customerName`, `itemsSummary` (inclui `selectedOption` quando presente) |
| Falha SES após gravar | `201` + log (sem rollback) |
| Retry SES | Apenas log CloudWatch |

## O que implementar

### `src/lib/ses.ts`

- [ ] Singleton `SESClient`
- [ ] Template name via env: `SES_TEMPLATE_NAME`

### `src/services/email.service.ts` (implementar)

- [ ] `sendOrderNotification(order)`:
  - Se `SES_ENABLED !== 'true'`: log e return (comportamento fase 1)
  - `SendTemplatedEmail` com template `afro90s-{env}-ses-new-order`
  - Template data: `{ orderId, customerName, itemsSummary }` — `itemsSummary` lista produto, qty e opção
  - Destino: `ADMIN_EMAIL`
  - Remetente: `SES_FROM_EMAIL`
  - Em falha: log error, não propagar (pedido já gravado)

### Integrar em `order.service.ts`

- [ ] Após `PutItem` bem-sucedido, chamar `emailService.sendOrderNotification(order)`

### Testes

- [ ] `SES_ENABLED=false` → não chama SES
- [ ] `SES_ENABLED=true` → chama `SendTemplatedEmail` com dados corretos
- [ ] Falha SES → pedido ainda retorna `201`

## Pré-requisitos

- Fase 3 entregue
- Infra task 18 (SES) deployada com identidade verificada

## Critérios de conclusão

- [ ] `POST /orders` envia e-mail em dev (sandbox)
- [ ] E-mail contém `orderId` e `customerName`
- [ ] Falha SES não impede `201`
- [ ] Atualizar **Status** para `concluída`
