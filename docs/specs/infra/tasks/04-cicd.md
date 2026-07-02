# Task 04 — CI/CD (GitHub Actions)

**Fase:** 0 — Fundação  
**Status:** pendente  
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
| Código Lambda | **Fora de escopo** — deploy via afro90sBackend ([ADR-007](../../foundation/adr/007-backend-lambda-s3-deploy.md)) |
| CDK bootstrap | Na pipeline, **antes** do primeiro `cdk deploy` (idempotente; substitui CLI local) |

## O que é o CDK bootstrap

Stack `CDKToolkit` no CloudFormation — infra interna do CDK (bucket S3 de assets, roles de publish/deploy, SSM `/cdk-bootstrap/*`). **Obrigatório antes do primeiro deploy**, mas **não** precisa ser criado localmente: a role OIDC de deploy (`afro90s-github-cdk-dev` / `-prod`) já tem permissão para rodar `cdk bootstrap`.

Ordem na primeira execução:

```
OIDC + roles (task 00, manual)  →  bootstrap (pipeline, 1×)  →  cdk deploy
```

## O que implementar

### `.github/workflows/cdk-validate.yml`

- [ ] Trigger: `pull_request` com `paths: ['infra/**']`
- [ ] Permissions: `id-token: write`, `contents: read`, `pull-requests: write`
- [ ] Steps:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (Node 20)
  3. `aws-actions/configure-aws-credentials@v4` com `${{ vars.AWS_ROLE_ARN_PR }}`
  4. `npm ci` dentro de `infra/`
  5. `npm run build`
  6. `npm run synth:dev`
  7. `npm run diff:dev`
  8. `actions/upload-artifact@v4` com `cdk.out/`

### `.github/workflows/cdk-deploy-dev.yml`

- [ ] Trigger: `push` em branch `dev` com `paths: ['infra/**']`
- [ ] `environment: dev`
- [ ] Steps:
  1. Checkout → Node 20
  2. `configure-aws-credentials` com `${{ vars.AWS_ROLE_ARN }}`
  3. `npm ci && npm run build` (dentro de `infra/`)
  4. `npx cdk bootstrap aws://083171867610/us-east-1` *(idempotente — ok em todo deploy)*
  5. `npm run deploy:dev -- --require-approval never`
  6. `bash infra/scripts/export-outputs.sh dev`
  7. Upload `outputs-dev.json` como artifact

### `.github/workflows/cdk-deploy-prod.yml`

- [ ] Trigger: `push` em branch `main` com `paths: ['infra/**']`
- [ ] `environment: production`
- [ ] Steps idênticos ao deploy-dev (inclui `cdk bootstrap`), substituindo `dev` por `prod`

### Snippet OIDC (todos os workflows)

```yaml
permissions:
  id-token: write
  contents: read

- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ vars.AWS_ROLE_ARN }}
    aws-region: us-east-1
```

### Regras

- [ ] Nenhuma variável `AWS_ACCESS_KEY_ID` no repositório
- [ ] `AWS_ROLE_ARN_PR` como repository variable (read-only, para PRs)
- [ ] `AWS_ROLE_ARN` como environment variable por ambiente (deploy)

## Pré-requisitos

- [Task 03](03-tags-naming.md) concluída (tags + scripts npm validados)

## Critérios de conclusão

- [ ] PR alterando `infra/**` dispara `cdk-validate.yml`; artifact `cdk.out` disponível
- [ ] Primeiro deploy cria stack `CDKToolkit` (bootstrap) e em seguida as stacks do app
- [ ] Merge em `dev` dispara `cdk-deploy-dev.yml` e CloudFormation atualiza
- [ ] Merge em `main` dispara `cdk-deploy-prod.yml` com environment `production`
- [ ] Nenhum secret AWS nas variáveis do repositório
- [ ] Atualizar **Status** para `concluída`
