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
| Código Lambda | Placeholder via CDK; **código real** deployado pelo **afro90sBackend** ([ADR-007](../../../foundation/adr/007-backend-lambda-s3-deploy.md)) |
| Artefatos | Bucket `afro90s-{env}-s3-lambda-artifacts` |
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

### S3 — bucket artefatos Lambda

- [ ] Nome: `afro90s-{env}-s3-lambda-artifacts`
- [ ] `blockPublicAccess: BlockPublicAccess.BLOCK_ALL`
- [ ] `encryption: BucketEncryption.S3_MANAGED`
- [ ] `versioning: true` (rollback de pacotes)
- [ ] Lifecycle (opcional v1): expirar objetos `api/*.zip` com mais de 90 dias
- [ ] Prefixo: `api/{sha}.zip`, `api/latest.zip`
- [ ] Output `LambdaArtifactsBucketName` + SSM `/afro90s/{env}/lambda-artifacts-bucket`

### Lambda — função única

- [ ] Nome: `afro90s-{env}-lambda-api`
- [ ] `runtime: Runtime.NODEJS_20_X`
- [ ] `handler: 'handler.handler'`
- [ ] `memorySize: 256`, `timeout: Duration.seconds(29)`
- [ ] **Código inicial (placeholder)** — não usar `NodejsFunction` com source do backend:
  ```typescript
  code: lambda.Code.fromInline(`
    exports.handler = async () => ({
      statusCode: 503,
      body: JSON.stringify({ code: 'NOT_DEPLOYED', message: 'Awaiting deploy from afro90sBackend' }),
    });
  `),
  ```
- [ ] Após primeiro deploy do backend, código é gerenciado via `update-function-code` — CDK deploys subsequentes **não** devem sobrescrever o zip (usar `lambda.Code.fromBucket` com ignore changes ou documentar que redeploy infra skip code)
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
- [ ] `CfnOutput` `LambdaFunctionName` = nome da função API
- [ ] `CfnOutput` `LambdaArtifactsBucketName`
- [ ] SSM: `/afro90s/{env}/api-base-url`
- [ ] SSM: `/afro90s/{env}/lambda-function-name`
- [ ] SSM: `/afro90s/{env}/lambda-artifacts-bucket`

## Pré-requisitos

- [Task 09](09-ssm-params.md) concluída

## Critérios de conclusão

- [ ] `GET /products` retorna `200` com `{ "items": [], "nextCursor": null }`
- [ ] `GET /products/{id}` retorna `404` para ID inexistente
- [ ] `POST /orders` retorna `201` (sem envio de e-mail — apenas DynamoDB)
- [ ] CORS headers presentes para origem CloudFront
- [ ] Rota inexistente retorna `404`
- [ ] Output `ApiBaseUrl` no CloudFormation
- [ ] Atualizar **Status** para `concluída`
