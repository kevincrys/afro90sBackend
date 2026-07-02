# Pipelines — afro90sBackend

**Status:** Aprovado  
**Última atualização:** 2025-06-23  
**ADR:** [007-backend-lambda-s3-deploy](https://github.com/kevincrys/afro90sInfra/blob/main/docs/foundation/adr/007-backend-lambda-s3-deploy.md)

## Escopo deste repositório

- **CI** — validação em todo PR/push
- **CD** — deploy do **código Lambda** via S3 + `update-function-code`

Config da Lambda (env vars, IAM, timeout) continua no **afro90sInfra** (CDK).

## Workflows

| Workflow | Arquivo | Trigger | Ação |
|----------|---------|---------|------|
| CI | `ci.yml` | PR + push | build → test:coverage → lint |
| Deploy dev | `deploy-dev.yml` | Push `dev` | bundle → S3 → update-function-code |
| Deploy prod | `deploy-prod.yml` | Push `main` | Idem + environment `production` |

## Fluxo de deploy

```
merge dev/main
    → npm run bundle (esbuild)
    → lambda.zip
    → s3://ARTIFACT_BUCKET/api/{sha}.zip
    → s3://ARTIFACT_BUCKET/api/latest.zip
    → aws lambda update-function-code
    → Lambda executa código novo
```

## Variables (por environment)

| Variable | Origem |
|----------|--------|
| `AWS_ROLE_ARN` | IAM role OIDC backend |
| `AWS_REGION` | `us-east-1` |
| `ARTIFACT_BUCKET` | Output CDK `LambdaArtifactsBucketName` |
| `LAMBDA_FUNCTION_NAME` | Output CDK `LambdaFunctionName` |

## Tasks de implementação

| Task | Descrição |
|------|-----------|
| [00-setup-repo.md](../backend/tasks/00-setup-repo.md) | Estrutura + CI |
| [00-deploy-api.md](../backend/tasks/00-deploy-api.md) | Bundle + deploy workflows |

## Critérios de aceite

- [ ] PR dispara CI; merge bloqueado se falhar
- [ ] Push em `dev` atualiza Lambda dev
- [ ] Push em `main` atualiza Lambda prod (com approval)
- [ ] Rollback possível via zip `{sha}` no S3
- [ ] Nenhum secret AWS no repositório
