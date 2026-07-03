# Guia para Agentes de IA — afro90sBackend

## Antes de implementar

1. [docs/foundation/vision.md](docs/foundation/vision.md)
2. **[docs/foundation/adr/008-backend-monorepo-lerna.md](docs/foundation/adr/008-backend-monorepo-lerna.md)** — layout `resources/` + `libs/`
3. **[docs/specs/backend/api-routes.md](docs/specs/backend/api-routes.md)**
4. [docs/specs/backend/tasks/](docs/specs/backend/tasks/)
5. [.cursor/rules/](.cursor/rules/)

## Estrutura

| Pasta | Papel |
|-------|-------|
| `resources/{flow}/` | 1 package = 1 Lambda (`handler.ts` + rotas do fluxo) |
| `libs/{nome}/` | Código compartilhado (`@afro90s/models`, `@afro90s/http`, …) |
| `flow` | Nome da pasta = nome no deploy (SSM, S3, CI matrix) |

Consultar [overview.md](docs/specs/backend/overview.md) — tabela de mapeamento flat → monorepo.

## Deploy

- Bundle **por fluxo**: `resources/{flow}/` → `handler.js` na raiz do zip
- Workflows `deploy-*.yml` — matrix 4 fluxos
- `scripts/deploy-flow.sh` — S3 + `update-function-code`; nomes via **SSM**
- **GitHub Environment:** `AWS_ROLE_ARN`, `AWS_REGION`, `ARTIFACT_BUCKET` apenas
- **Não** duplicar nomes das Lambdas no GitHub
- **Não** implementar CDK neste repo

Spec: [docs/specs/backend/tasks/00-deploy-api.md](docs/specs/backend/tasks/00-deploy-api.md)

## O que não fazer

- Não commitar secrets
- Não provisionar AWS (CDK = afro90sInfra)
- Não usar `src/` flat — código novo vai em `libs/` ou `resources/`
- Não router monolítico único — cada Lambda só expõe suas rotas
