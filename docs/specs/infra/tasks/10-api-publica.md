# Task 10 — API pública (HTTP API + rotas públicas)

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`cdk.md`](../cdk.md)

## Objetivo

Implementar o HTTP API Gateway com a Lambda de router e as **3 rotas públicas** (`GET /products`, `GET /products/{id}`, `POST /orders`). O authorizer Cognito e as rotas admin ficam para as fases 2 e 3.

> **`POST /orders` nesta fase:** cria o pedido no DynamoDB mas **não envia e-mail**. O handler deve aceitar ausência do SES graciosamente (log de aviso, sem falha).

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Tipo API | HTTP API (não REST API) |
| Stage | `dev` ou `prod` (mesmo que o `env`) |
| Lambda | 1 função com router interno |
| Timeout | 29s |
| Memory | 256 MB |
| Bundling | esbuild via `NodejsFunction` |
| Payload format | 2.0 |
| Throttling | `burstLimit: 50`, `rateLimit: 100` |
| CORS | Origem = `CloudFrontWebUrl` |

## O que implementar

### HTTP API

- [ ] Criar `HttpApi` com nome `afro90s-{env}-apigw-api`
- [ ] Stage automático com nome `dev` ou `prod`
- [ ] CORS:
  ```typescript
  corsPreflight: {
    allowOrigins: [cloudfrontWebUrl],  // lido do SSM
    allowMethods: [GET, POST, PUT, DELETE, OPTIONS],
    allowHeaders: ['Content-Type', 'Authorization'],
  }
  ```
- [ ] Throttling default: `throttlingBurstLimit: 50`, `throttlingRateLimit: 100`

### Lambda — função única

- [ ] Nome: `afro90s-{env}-lambda-api`
- [ ] `runtime: Runtime.NODEJS_20_X`
- [ ] `memorySize: 256`, `timeout: Duration.seconds(29)`
- [ ] `bundling: { minify: true }` via `NodejsFunction`
- [ ] LogGroup com retenção 14 dias (task 19)
- [ ] Role: `afro90s-{env}-role-lambda-public` (task 08)
- [ ] Variáveis de ambiente:
  - `PRODUCTS_TABLE`, `ORDERS_TABLE`, `ASSETS_CDN_URL`
  - `AWS_REGION` = `us-east-1`
  - `SES_ENABLED` = `false` ← desativa envio de e-mail na fase 1

### Rotas públicas (fase 1)

- [ ] `GET /products` → Lambda (sem authorizer)
- [ ] `GET /products/{id}` → Lambda (sem authorizer)
- [ ] `POST /orders` → Lambda (sem authorizer)

### Outputs

- [ ] `CfnOutput` `ApiBaseUrl` = URL base sem stage e sem barra final
- [ ] SSM: `/afro90s/{env}/api-base-url`

## Pré-requisitos

- Task 05 (DynamoDB), 06 (Assets), 07 (Frontend), 08 (IAM pública), 09 (SSM) concluídas

## Critérios de conclusão

- [ ] `GET /products` retorna `200` com `{ "items": [], "nextCursor": null }`
- [ ] `GET /products/{id}` retorna `404` para ID inexistente
- [ ] `POST /orders` retorna `201` (sem envio de e-mail — apenas DynamoDB)
- [ ] CORS headers presentes para origem CloudFront
- [ ] Rota inexistente retorna `404`
- [ ] Output `ApiBaseUrl` no CloudFormation
- [ ] Atualizar **Status** para `concluída`
