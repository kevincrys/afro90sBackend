# Backend — Overview

**Status:** Aprovado  
**Última atualização:** 2026-07-10

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
| E-mail | SES (task 16 — **código pronto**; ativo com `SES_ENABLED=true` após secrets/verify) |
| Validação | Zod |
| Bundling | esbuild (`npm run bundle`) |
| Deploy | S3 artifact + `update-function-code` ([ADR-007](docs/foundation/adr/007-backend-lambda-s3-deploy.md)) |

## Estrutura do repositório (monorepo Lerna)

Ver [ADR-008](../../foundation/adr/008-backend-monorepo-lerna.md).

```
afro90sBackend/
├── libs/
│   ├── http/           # createHandler, createAdminHandler, auth, respostas HTTP
│   ├── models/         # Zod schemas (@afro90s/models)
│   ├── repositories/   # DynamoDB (@afro90s/repositories)
│   └── storage/        # S3 / imagens (@afro90s/storage)
├── resources/
│   ├── products-public/
│   ├── orders-public/
│   ├── products-admin/
│   └── orders-admin/   # uma Lambda por fluxo; handler + routes + services
├── scripts/            # smoke tests, bundle, deploy
├── package.json
└── lerna.json
```

## Contrato da API

Todas as rotas, headers, payloads e respostas estão em **[api-routes.md](api-routes.md)** — consultar antes de implementar qualquer endpoint.

Modelos de dados: **[data-models.md](data-models.md)**.

Refinamento incremental das specs: **[tasks/README.md](tasks/README.md)** (backlog por tarefa; `api-routes.md` permanece o contrato único).

## Variáveis de ambiente

Ver [outputs da infra](../infra/outputs.md). Injetadas pelo CDK no deploy da Lambda.

## Regras de negócio v1

- `POST /orders` valida estoque mas **não decrementa** automaticamente
- Itens com `selectedOption` quando o produto define `options`
- Decremento de estoque via `PUT /admin/products/{id}/stock` (admin)
- Atualização de status de pedido via `PUT /admin/orders/{id}` (admin; body `{ "status": "..." }`)
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
