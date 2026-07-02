# Visão e Escopo — afro90sBackend

## Objetivo

Implementar a **API REST serverless** do Afro90s e **publicar o código Lambda** via pipeline deste repositório.

## Escopo

- Código-fonte Lambda (handlers, serviços, modelos, testes)
- CI (build, test, lint)
- **CD — deploy do código**: esbuild → S3 → `update-function-code` ([ADR-007](https://github.com/kevincrys/afro90sInfra/blob/main/docs/foundation/adr/007-backend-lambda-s3-deploy.md))
- Specs locais de backend

## Fora de escopo

- Criação de recursos AWS (Lambda shell, API GW, DynamoDB) → **afro90sInfra**
- Env vars, IAM, timeout da Lambda → **afro90sInfra** (CDK)
- Frontend → **afro90sFrontend**

## Divisão de responsabilidades

| O quê | Quem |
|-------|------|
| Código em runtime | **afro90sBackend** |
| Bucket `s3-lambda-artifacts` | afro90sInfra |
| Função Lambda (recurso) | afro90sInfra |
| Config (env, memory, timeout) | afro90sInfra |

## Referências

- [00-deploy-api.md](../specs/backend/tasks/00-deploy-api.md)
- [pipelines/overview.md](../specs/pipelines/overview.md)
- [api-routes.md](../specs/backend/api-routes.md)
