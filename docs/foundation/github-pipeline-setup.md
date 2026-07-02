# Configuração de Pipelines — afro90sBackend

Guia para configurar **GitHub Actions**, **Environments**, **OIDC AWS** e **branch protection** neste repositório.

> OIDC provider, bucket de artefatos e Lambda: [afro90sInfra — github-pipeline-setup.md](https://github.com/kevincrys/afro90sInfra/blob/main/docs/foundation/github-pipeline-setup.md) · [ADR-007](https://github.com/kevincrys/afro90sInfra/blob/main/docs/foundation/adr/007-backend-lambda-s3-deploy.md)

## Repositório

| Campo | Valor |
|-------|-------|
| GitHub | `kevincrys/afro90sBackend` |
| CI | `ci.yml` — sem AWS |
| Deploy | `deploy-dev.yml` / `deploy-prod.yml` — S3 + Lambda |
| Auth AWS | OIDC — sem access keys |

## Branches

| Branch | Deploy |
|--------|--------|
| `dev` | Automático → Lambda **dev** |
| `main` | Automático → Lambda **production** (approval) |

## Workflows

| Arquivo | Trigger | Environment |
|---------|---------|-------------|
| `ci.yml` | PR + push | — |
| `deploy-dev.yml` | Push `dev` | `dev` |
| `deploy-prod.yml` | Push `main` | `production` |

Spec: [00-deploy-api.md](../specs/backend/tasks/00-deploy-api.md)

### Deploy (resumo)

1. `npm run test:coverage`
2. `npm run bundle && npm run package:lambda`
3. `aws s3 cp lambda.zip s3://$ARTIFACT_BUCKET/api/$SHA.zip`
4. `aws s3 cp lambda.zip s3://$ARTIFACT_BUCKET/api/latest.zip`
5. `aws lambda update-function-code --s3-bucket ... --s3-key api/latest.zip`

## AWS — Role IAM

| Role | Trigger | Policy |
|------|---------|--------|
| `afro90s-github-backend-dev` | push `dev` | `s3:PutObject` em `.../api/*` + `lambda:UpdateFunctionCode` |
| `afro90s-github-backend-prod` | push `main` | Idem prod |

## GitHub Environments

### `dev`

| Variable | Exemplo |
|----------|---------|
| `AWS_ROLE_ARN` | `arn:aws:iam::083171867610:role/afro90s-github-backend-dev` |
| `AWS_REGION` | `us-east-1` |
| `ARTIFACT_BUCKET` | `afro90s-dev-s3-lambda-artifacts` |
| `LAMBDA_FUNCTION_NAME` | `afro90s-dev-lambda-api` |

### `production`

Mesmas variables com valores prod + **required reviewers**.

## Branch protection — `main`

- Require PR + 1 approval
- Require status check `ci`
- Block force push

## Pré-requisitos

- [ ] Infra task 10 deployada (Lambda + bucket artefatos)
- [ ] Roles IAM backend criadas (infra task 00)
- [ ] Variables preenchidas nos environments

## Checklist

- [ ] `ci.yml` + `deploy-dev.yml` + `deploy-prod.yml` commitados
- [ ] Merge em `dev` atualiza Lambda
- [ ] Nenhum `AWS_ACCESS_KEY_ID` no repo

## Referências

- [Pipeline overview](../specs/pipelines/overview.md)
- [Task 00-deploy-api](../specs/backend/tasks/00-deploy-api.md)
