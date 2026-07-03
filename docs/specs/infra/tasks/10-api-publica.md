# Task 10 — API pública (HTTP API + rotas públicas)

**Fase:** 1 — Site público  
**Status:** concluída  
**Arquivos alvo:** [`resources.md`](../resources.md), [`cdk.md`](../cdk.md)

## Objetivo

Implementar o HTTP API Gateway com **4 Lambdas** (uma por fluxo) e as **3 rotas públicas** (`GET /products`, `GET /products/{id}`, `POST /orders`). Lambdas admin são criadas como placeholder (rotas na task 16). O authorizer Cognito fica para a fase 2.

> **`POST /orders` nesta fase:** cria o pedido no DynamoDB mas **não envia e-mail**. O handler deve aceitar ausência do SES graciosamente (log de aviso, sem falha).

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Tipo API | HTTP API (não REST API) |
| Stage | `dev` ou `prod` (mesmo que o `env`) |
| Lambdas | **4 funções** — uma por fluxo (ver `resources.md`) |
| Timeout | 29s |
| Memory | 256 MB |
| Código Lambda | Placeholder via CDK; **código real** deployado pelo **afro90sBackend** ([ADR-007](../../../foundation/adr/007-backend-lambda-s3-deploy.md)) |
| Artefatos | Bucket `afro90s-{env}-s3-lambda-artifacts` |
| Payload format | 2.0 |
| Throttling | `burstLimit: 10`, `rateLimit: 5` (~50 usuários/dia; proteção contra abuso) |
| CORS | Origem = `CloudFrontWebUrl` |

## O que implementar

### HTTP API

- [x] Criar `HttpApi` com nome `afro90s-{env}-apigw-api`
- [x] Stage com nome `dev` ou `prod`
- [x] CORS:
  ```typescript
  corsPreflight: {
    allowOrigins: [cloudfrontWebUrl],  // lido do SSM
    allowMethods: [GET, POST, PUT, DELETE, OPTIONS],
    allowHeaders: ['Content-Type', 'Authorization'],
  }
  ```
- [x] Throttling default: `burstLimit: 10`, `rateLimit: 5`

### S3 — bucket artefatos Lambda

- [x] Nome: `afro90s-{env}-s3-lambda-artifacts`
- [x] `blockPublicAccess: BlockPublicAccess.BLOCK_ALL`
- [x] `encryption: BucketEncryption.S3_MANAGED`
- [x] `versioning: true` (rollback de pacotes)
- [x] Lifecycle: expirar objetos `{flow}/*.zip` com mais de 90 dias (por fluxo)
- [x] Prefixos: `{flow}/{sha}.zip`, `{flow}/latest.zip` — flows: `products-public`, `orders-public`, `products-admin`, `orders-admin`
- [x] Output `LambdaArtifactsBucketName` + SSM `/afro90s/{env}/lambda-artifacts-bucket`

### Lambdas — uma por fluxo

| Fluxo | Nome | Role | Rotas (fase 1) |
|-------|------|------|----------------|
| products-public | `afro90s-{env}-lambda-products-public` | `role-lambda-products-public` | `GET /products`, `GET /products/{id}` |
| orders-public | `afro90s-{env}-lambda-orders-public` | `role-lambda-orders-public` | `POST /orders` |
| products-admin | `afro90s-{env}-lambda-products-admin` | `role-lambda-admin` | *(task 16)* |
| orders-admin | `afro90s-{env}-lambda-orders-admin` | `role-lambda-admin` | *(task 16)* |

Para cada função:

- [x] `runtime: Runtime.NODEJS_20_X`
- [x] `handler: 'handler.handler'`
- [x] `memorySize: 256`, `timeout: Duration.seconds(29)`
- [x] **Código inicial (placeholder)** — não usar `NodejsFunction` com source do backend
- [x] LogGroup com retenção 14 dias (task 19)
- [x] Variáveis de ambiente por fluxo (tabelas, CDN, `SES_ENABLED=false`)
- [x] **Não** setar `AWS_REGION` (reservada pela Lambda)

### Rotas públicas (fase 1)

- [x] `GET /products` → `lambda-products-public` (sem authorizer)
- [x] `GET /products/{id}` → `lambda-products-public` (sem authorizer)
- [x] `POST /orders` → `lambda-orders-public` (sem authorizer)

### Outputs e SSM

- [x] `CfnOutput` `ApiBaseUrl` = URL base sem stage e sem barra final
- [x] `CfnOutput` `LambdaProductsPublicFunctionName`, `LambdaOrdersPublicFunctionName`, `LambdaProductsAdminFunctionName`, `LambdaOrdersAdminFunctionName`
- [x] `CfnOutput` `LambdaArtifactsBucketName`
- [x] SSM: `/afro90s/{env}/api-base-url`
- [x] SSM: `/afro90s/{env}/lambda-{flow}-name` (4 parâmetros)
- [x] SSM: `/afro90s/{env}/lambda-artifacts-bucket`
- [x] SSM: `/afro90s/{env}/whatsapp-number` = `5521920051220`

## Pré-requisitos

- [Task 09](09-ssm-params.md) concluída

## Critérios de conclusão

- [ ] `GET /products` retorna `200` com `{ "items": [], "nextCursor": null }` (após deploy do backend)
- [ ] `GET /products/{id}` retorna `404` para ID inexistente (após deploy do backend)
- [ ] `POST /orders` retorna `201` (sem envio de e-mail — apenas DynamoDB; após deploy do backend)
- [ ] CORS headers presentes para origem CloudFront (validar pós-deploy)
- [ ] Rota inexistente retorna `404` (após deploy do backend)
- [x] Output `ApiBaseUrl` no CloudFormation
- [x] Atualizar **Status** para `concluída`
