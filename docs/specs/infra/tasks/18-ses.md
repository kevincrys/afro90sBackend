# Task 18 — SES (notificação de pedidos por e-mail)

**Fase:** 4 — Email  
**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`outputs.md`](../outputs.md)

## Objetivo

Configurar identidade SES, template de e-mail e conectar o envio ao `POST /orders`. Esta é a última entrega funcional — `POST /orders` já funciona desde a fase 1, agora passa a enviar e-mail.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Dev | Sandbox SES — e-mails verificados individualmente |
| Prod | Domínio `afro90s.com.br` (quando comprado) |
| Template | SES template gerenciado (não string na Lambda) |
| Variáveis do template | `{{orderId}}`, `{{customerName}}` |
| Parâmetros | `ses-from-email` e `admin-notification-email` via SSM |
| IAM | `ses:SendTemplatedEmail` escopo mínimo |

## O que implementar

### SES — identidade (setup manual pré-deploy — dev)

> Feito no console SES `us-east-1`. Já deve ter sido verificado na task 00.

- [ ] Confirmar que e-mail remetente está verificado em SES sandbox
- [ ] Confirmar que e-mail destino (admin) está verificado em SES sandbox
- [ ] Em prod: quando domínio for comprado, criar `CfnEmailIdentity` para o domínio

### SES — template CDK

- [ ] Criar `CfnTemplate` com nome `afro90s-{env}-ses-new-order`:

```typescript
new CfnTemplate(this, 'OrderTemplate', {
  template: {
    templateName: `afro90s-${env}-ses-new-order`,
    subjectPart: 'Novo pedido #{{orderId}}',
    htmlPart: `
      <h2>Novo pedido recebido</h2>
      <p><strong>ID:</strong> {{orderId}}</p>
      <p><strong>Cliente:</strong> {{customerName}}</p>
    `,
    textPart: 'Novo pedido {{orderId}} de {{customerName}}',
  },
});
```

### SSM — parâmetros de e-mail

- [ ] `/afro90s/{env}/ses-from-email` — e-mail remetente verificado
- [ ] `/afro90s/{env}/admin-notification-email` — e-mail destino admin

### IAM — adicionar SES à role pública (task 08)

- [ ] Atualizar `afro90s-{env}-role-lambda-public` com:
  - `ses:SendTemplatedEmail`
  - Resource: ARN da identidade verificada (não `*`)

### Lambda — habilitar envio

- [ ] Atualizar variável de ambiente na Lambda:
  - `SES_ENABLED=true` (antes era `false`)
  - `SES_FROM_EMAIL` — lido do SSM
  - `ADMIN_EMAIL` — lido do SSM
  - `SES_TEMPLATE_NAME` = `afro90s-{env}-ses-new-order`

### Outputs CloudFormation

- [ ] `CfnOutput` `SesFromEmail`
- [ ] `CfnOutput` `AdminNotificationEmail`

## Pré-requisitos

- Tasks 00–17 concluídas (fases 1, 2 e 3 entregues)
- E-mail remetente verificado no SES sandbox

## Critérios de conclusão

- [ ] Template `afro90s-dev-ses-new-order` visível no console SES
- [ ] `POST /orders` com body válido → `201` + e-mail recebido no endereço admin
- [ ] E-mail contém `orderId` e `customerName` corretos
- [ ] `ses:SendTemplatedEmail` restrito à identidade verificada (verificar no IAM)
- [ ] Outputs `SesFromEmail` e `AdminNotificationEmail` no CloudFormation
- [ ] `resources.md` e `outputs.md` atualizados
- [ ] Atualizar **Status** para `concluída`
