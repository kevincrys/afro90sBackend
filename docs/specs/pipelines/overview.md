# Pipelines — afro90sBackend

**Status:** Aprovado  
**Última atualização:** 2026-07-02  
**ADR:** [007](../../foundation/adr/007-backend-lambda-s3-deploy.md) · [008](../../foundation/adr/008-backend-monorepo-lerna.md)

## Escopo deste repositório

- **CI** — validação do monorepo (todos os packages)
- **CD** — deploy do código de **cada** package em `resources/{flow}/`

Config da Lambda (env vars, IAM, timeout) → **afro90sInfra**.

## Workflows

| Workflow | Arquivo | Trigger | Ação |
|----------|---------|---------|------|
| CI | `ci.yml` | PR + push | build → test:coverage → lint |
| Deploy dev | `deploy-dev.yml` | Push `dev` | bundle por fluxo → matrix → S3 → update-function-code |
| Deploy prod | `deploy-prod.yml` | Push `main` | Idem + environment `prod` |

## Fluxo de deploy

```
merge dev/main
    → npm run test:coverage
    → para cada flow em resources/:
        esbuild → resources/{flow}/dist/handler.js
        zip → lambda.zip (handler.js na raiz)
    → matrix (4 fluxos):
        SSM: /afro90s/{env}/lambda-{flow}-name
        s3://ARTIFACT_BUCKET/{flow}/{sha}.zip
        s3://ARTIFACT_BUCKET/{flow}/latest.zip
        aws lambda update-function-code
```

Fluxos = pastas em `resources/`: `products-public`, `orders-public`, `products-admin`, `orders-admin`.

## Configuração CI

| Valor | Onde | Workflow |
|-------|------|----------|
| `ARTIFACT_BUCKET` | GitHub Environment | `vars.ARTIFACT_BUCKET` |
| Nome de cada Lambda | SSM (CDK) | `deploy-flow.sh` |
| `AWS_ROLE_ARN` | GitHub Environment | OIDC |

## Tasks

| Task | Descrição |
|------|-----------|
| [00-setup-repo.md](../backend/tasks/00-setup-repo.md) | Monorepo Lerna + CI |
| [00-deploy-api.md](../backend/tasks/00-deploy-api.md) | Bundle por fluxo + deploy |

## Critérios de aceite

- [ ] PR dispara CI no monorepo inteiro
- [ ] Push em `dev` atualiza as 4 Lambdas dev
- [ ] Push em `main` atualiza as 4 Lambdas prod (approval)
- [ ] Rollback via `{flow}/{sha}.zip` no S3
- [ ] Nenhum secret AWS no repositório
