# Backend — Overview

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Guia de implementação do backend Afro90s no repositório **afro90sBackend**.

## Stack

| Componente | Tecnologia |
|------------|------------|
| Runtime | AWS Lambda **Node.js 20.x** |
| Linguagem | **TypeScript** |
| API | REST via API Gateway HTTP API |
| Banco | DynamoDB |
| Storage imagens | S3 |
| E-mail | SES |
| Validação | Zod |
| Bundling | esbuild (`npm run bundle`) |
| Deploy | S3 artifact + `update-function-code` ([ADR-007](docs/foundation/adr/007-backend-lambda-s3-deploy.md)) |

## Estrutura sugerida do repositório

```
afro90sBackend/
├── src/
│   ├── handlers/
│   │   ├── products-public.ts
│   │   ├── orders-public.ts
│   │   ├── products-admin.ts
│   │   └── orders-admin.ts
│   ├── services/
│   │   ├── product-service.ts
│   │   ├── order-service.ts
│   │   ├── image-service.ts      # base64, stream → S3
│   │   └── email-service.ts
│   ├── repositories/
│   │   ├── product-repository.ts
│   │   └── order-repository.ts
│   ├── models/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── photo-input.ts
│   └── lib/
│       ├── response.ts           # helpers HTTP
│       ├── errors.ts
│       ├── pagination.ts
│       └── multipart.ts
├── tests/
├── package.json
└── tsconfig.json
```

## Contrato da API

Todas as rotas, headers, payloads e respostas estão em **[api-routes.md](api-routes.md)** — consultar antes de implementar qualquer endpoint.

Modelos de dados: **[data-models.md](data-models.md)**.

Refinamento incremental das specs: **[tasks/README.md](tasks/README.md)** (backlog por tarefa; `api-routes.md` permanece o contrato único).

## Variáveis de ambiente

Ver [outputs da infra](../infra/outputs.md). Injetadas pelo CDK no deploy da Lambda.

## Regras de negócio v1

- `POST /orders` valida estoque mas **não decrementa** automaticamente
- Decremento de estoque via `PATCH /admin/products/{id}/stock` (admin)
- Pedido criado sempre com status `SOLICITADO`
- Imagens admin: suportar `url`, `base64` e `stream` (ver api-routes.md)

## Testes

| Tipo | Escopo |
|------|--------|
| Unit | Services, validação Zod, transições de status |
| Integration | DynamoDB Local ou LocalStack |
| Contract | Schemas alinhados a api-routes.md |

## Referências

- [API routes](api-routes.md)
- [Data models](data-models.md)
- [ADR-004](../../foundation/adr/004-serverless-architecture.md)
- [ADR-005](../../foundation/adr/005-admin-auth-v1.md)
