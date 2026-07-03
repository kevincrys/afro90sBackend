# Visão e Escopo — afro90sBackend

## Objetivo

Implementar a **API REST serverless** do Afro90s em monorepo Lerna e **publicar o código** das 4 Lambdas via pipeline.

## Escopo

- Monorepo: `resources/` (1 package = 1 Lambda) + `libs/` (código compartilhado)
- CI (build, test, lint em todos os packages)
- **CD:** esbuild por fluxo → S3 `{flow}/` → `update-function-code` ([ADR-007](adr/007-backend-lambda-s3-deploy.md), [ADR-008](adr/008-backend-monorepo-lerna.md))
- Specs locais de backend

## Fora de escopo

- Recursos AWS (Lambda shell, API GW, DynamoDB) → **afro90sInfra**
- Env vars, IAM, timeout → **afro90sInfra** (CDK)
- Frontend → **afro90sFrontend**

## Divisão de responsabilidades

| O quê | Quem |
|-------|------|
| Código em runtime | **afro90sBackend** (`resources/` + `libs/`) |
| Bucket `s3-lambda-artifacts` | afro90sInfra |
| 4 funções Lambda | afro90sInfra |
| Config (env, memory, timeout) | afro90sInfra |
| CI: `ARTIFACT_BUCKET` | GitHub Environment |
| Nomes das funções no deploy | SSM (`deploy-flow.sh`) |

## Referências

- [ADR-008 — monorepo](adr/008-backend-monorepo-lerna.md)
- [00-deploy-api.md](../specs/backend/tasks/00-deploy-api.md)
- [overview.md](../specs/backend/overview.md)
- [api-routes.md](../specs/backend/api-routes.md)
