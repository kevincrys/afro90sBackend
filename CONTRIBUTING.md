# Como Contribuir — afro90sBackend

## Fluxo

1. Branch `feat/` ou `fix/` a partir de `main` ou `dev`
2. PR com CI verde (coverage ≥ 80%)
3. Merge em `dev` → **deploy automático** das 4 Lambdas dev
4. Merge em `main` → deploy prod (approval)

## Deploy

Este repo **publica o código** das 4 Lambdas (`resources/{flow}/`). Não é necessário merge na infra para cada mudança de handler.

**Layout:** monorepo Lerna — ver [ADR-008](docs/foundation/adr/008-backend-monorepo-lerna.md).

**GitHub Environment** (`dev`/`prod`): `AWS_ROLE_ARN`, `AWS_REGION`, `ARTIFACT_BUCKET`.

Nomes das funções: lidos via SSM no CI — ver [00-deploy-api.md](docs/specs/backend/tasks/00-deploy-api.md).

## PR checklist

- [ ] CI verde
- [ ] Contrato API atualizado se aplicável
- [ ] Nenhum secret commitado
