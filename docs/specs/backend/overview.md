# Backend — Overview

**Status:** Aprovado  
**Última atualização:** 2026-07-02  
**ADR:** [008-backend-monorepo-lerna](../../foundation/adr/008-backend-monorepo-lerna.md)

## Objetivo

Guia de implementação do backend Afro90s no repositório **afro90sBackend** — monorepo Lerna com uma Lambda por package em `resources/` e libs compartilhadas.

## Stack

| Componente | Tecnologia |
|------------|------------|
| Monorepo | Lerna + npm workspaces |
| Runtime | AWS Lambda **Node.js 20.x** |
| Linguagem | **TypeScript** (strict) |
| API | REST via API Gateway HTTP API |
| HTTP (Lambda) | Middy por package em `resources/` |
| Banco | DynamoDB |
| Storage imagens | S3 |
| E-mail | SES |
| Validação | Zod (`libs/models`) |
| Bundling | esbuild por fluxo (`resources/{flow}/`) |
| Deploy | S3 + `update-function-code` ([ADR-007](../../foundation/adr/007-backend-lambda-s3-deploy.md)) |
| Testes | Vitest (cobertura agregada ≥ 80% na raiz) |

## Estrutura do repositório

```
afro90sBackend/
├── lerna.json
├── package.json                 # workspaces: resources/*, libs/*
├── vitest.config.ts             # projects / coverage agregada
├── libs/
│   ├── models/                  # @afro90s/models — Zod, tipos, ApiError
│   ├── http/                    # @afro90s/http — response, pagination, CORS helpers
│   ├── dynamodb/                # @afro90s/dynamodb — client singleton
│   ├── repositories/            # @afro90s/repositories — products, orders
│   ├── services/                # @afro90s/services — product, order, email, image
│   ├── auth/                    # @afro90s/auth — middleware Cognito (fase 2)
│   └── aws-s3/                  # @afro90s/aws-s3 — client S3 (fase 3)
├── resources/
│   ├── products-public/         # @afro90s/products-public
│   │   ├── package.json
│   │   └── src/
│   │       ├── handler.ts       # entry → handler.handler
│   │       └── routes/
│   ├── orders-public/           # @afro90s/orders-public
│   ├── products-admin/          # @afro90s/products-admin
│   └── orders-admin/            # @afro90s/orders-admin
├── scripts/
│   ├── bundle.mjs               # bundle por flow
│   ├── package-lambda.mjs
│   ├── flows.sh
│   └── deploy-flow.sh
└── docs/
```

> Libs adicionais (`aws-ses`, etc.) entram em `libs/` conforme as tasks de fase — não criar pacotes vazios antecipadamente.

## Lambdas (4 fluxos)

| Pasta `resources/` | Package | Lambda AWS | Rotas |
|--------------------|---------|------------|-------|
| `products-public` | `@afro90s/products-public` | `lambda-products-public` | `GET /products`, `GET /products/{id}` |
| `orders-public` | `@afro90s/orders-public` | `lambda-orders-public` | `POST /orders` |
| `products-admin` | `@afro90s/products-admin` | `lambda-products-admin` | `/admin/products*` |
| `orders-admin` | `@afro90s/orders-admin` | `lambda-orders-admin` | `/admin/orders*` |

O **nome da pasta** = `flow` no deploy (S3, SSM, matrix CI).

## Mapeamento de paths (tasks → monorepo)

| Antes (flat) | Monorepo |
|--------------|----------|
| `src/models/` | `libs/models/` |
| `src/utils/response.ts`, `pagination.ts` | `libs/http/` |
| `src/models/errors.ts` + throw helpers | `libs/models/` + `libs/http/` |
| `src/lib/dynamodb.ts` | `libs/dynamodb/` |
| `src/repositories/` | `libs/repositories/` |
| `src/services/` | `libs/services/` |
| `src/middleware/auth.ts` | `libs/auth/` |
| `src/lib/s3.ts`, `ses.ts` | `libs/aws-s3/`, `libs/aws-ses/` |
| `src/routes/products.ts` | `resources/products-public/src/routes/` |
| `src/routes/orders.ts` | `resources/orders-public/src/routes/` |
| `src/routes/admin/*` | `resources/products-admin` / `orders-admin` |

## Contrato da API

Todas as rotas, headers, payloads e respostas estão em **[api-routes.md](api-routes.md)**.

Modelos: **[data-models.md](data-models.md)**. Backlog: **[tasks/README.md](tasks/README.md)**.

## Variáveis de ambiente

Injetadas pelo CDK em cada Lambda — ver [outputs da infra](https://github.com/kevincrys/afro90sInfra/blob/main/docs/specs/infra/outputs.md).

**Deploy CI:** `ARTIFACT_BUCKET` no GitHub Environment; nomes das funções via SSM — [00-deploy-api.md](tasks/00-deploy-api.md).

## Regras de negócio v1

- `POST /orders` valida estoque mas **não decrementa** automaticamente
- Decremento via `PATCH /admin/products/{id}/stock` (admin)
- Pedido criado com status `SOLICITADO`
- Imagens admin: `url`, `base64`, `stream` (api-routes.md)

## Testes

| Tipo | Onde |
|------|------|
| Unit (libs) | `libs/*/src/**/*.test.ts` ou `libs/*/test/` |
| Unit (rotas) | `resources/*/src/**/*.test.ts` |
| Integration | `test/integration/` na raiz (opcional) |
| Cobertura CI | `npm run test:coverage` na raiz — threshold 80% agregado |

## Referências

- [API routes](api-routes.md)
- [Data models](data-models.md)
- [ADR-004](../../foundation/adr/004-serverless-architecture.md)
- [ADR-005](../../foundation/adr/005-admin-auth-v1.md)
- [ADR-008](../../foundation/adr/008-backend-monorepo-lerna.md)
