# Task 04 — CI/CD (GitHub Actions)

**Fase:** 0 — Fundação  
**Status:** concluída  
**Arquivos alvo:** [`overview.md`](../overview.md), [`cdk.md`](../cdk.md), `.github/workflows/`

## Objetivo

Criar os 3 workflows GitHub Actions que validam PRs e fazem deploy automático para `dev` e `prod`. Ativado desde a fase 0 para que todas as entregas faseadas já cheguem via pipeline.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Workflows | Separados: `validate`, `deploy-dev`, `deploy-prod` |
| PR | `build` → `synth` → `diff` + upload `cdk.out` |
| Branch `dev` push | Deploy automático em `dev` |
| Branch `main` push | Deploy automático em `prod` |
| Auth AWS | OIDC (`id-token: write`) — sem access keys |
| Path filter | Só dispara quando `infra/**` muda |
| Artefato | `cdk.out` guardado em PRs |
| CDK bootstrap | Idempotente, roda antes de cada deploy |
| Mensagens de erro (CI/CD e código) | **English** — ver [cdk.md](../cdk.md#mensagens-de-erro-código-e-ci) |

## O que implementar

### `.github/workflows/cdk-validate.yml`

- [x] Trigger: `pull_request` com `paths: ['infra/**']`
- [x] OIDC com `${{ vars.AWS_ROLE_ARN_PR }}`
- [x] build → synth:dev → diff:dev → artifact `cdk.out`

### `.github/workflows/cdk-deploy-dev.yml`

- [x] Trigger: push `dev` em `infra/**`
- [x] `environment: dev`
- [x] bootstrap → deploy:dev → `export-outputs.sh dev` → artifact

### `.github/workflows/cdk-deploy-prod.yml`

- [x] Trigger: push `main` em `infra/**`
- [x] `environment: prod`
- [x] bootstrap → deploy:prod → `export-outputs.sh prod` → artifact

### Script auxiliar

- [x] `infra/scripts/export-outputs.sh` (stub funcional; outputs completos na task 11)
- [x] `outputs-*.json` no `.gitignore`

## Pré-requisitos

- [Task 03](03-tags-naming.md) concluída

## Critérios de conclusão

- [x] Workflows commitados em `.github/workflows/`
- [x] Bootstrap incluído nos deploys dev/prod
- [x] OIDC via repository/environment variables (sem access keys)
- [ ] Validar end-to-end no GitHub após push (PR + merge dev)
- [x] Atualizar **Status** para `concluída`

## Próxima task

[05 — DynamoDB](05-dynamodb.md)
