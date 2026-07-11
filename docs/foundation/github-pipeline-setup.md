# Configuração de Pipelines — afro90sBackend

Guia para configurar **GitHub Actions**, **Environments**, **OIDC AWS** e **branch protection** neste repositório.

> OIDC provider, bucket de artefatos e Lambdas: [afro90sInfra — github-pipeline-setup.md](https://github.com/kevincrys/afro90sInfra/blob/main/docs/foundation/github-pipeline-setup.md) · [ADR-007](https://github.com/kevincrys/afro90sInfra/blob/main/docs/foundation/adr/007-backend-lambda-s3-deploy.md)

## Repositório

| Campo | Valor |
|-------|-------|
| GitHub | `kevincrys/afro90sBackend` |
| CI | `ci.yml` — sem AWS |
| Deploy | `deploy-dev.yml` / `deploy-prod.yml` — S3 + Lambda (4 fluxos) |
| Auth AWS | OIDC — sem access keys |

## Branches

| Branch | Deploy |
|--------|--------|
| `dev` | Automático → 4 Lambdas **dev** |
| `main` | Automático → 4 Lambdas **prod** (approval) |

## Workflows

| Arquivo | Trigger | Environment |
|---------|---------|-------------|
| `ci.yml` | PR + push | — |
| `deploy-dev.yml` | Push `dev` | `dev` |
| `deploy-prod.yml` | Push `main` | `prod` |
| `deploy-reusable.yml` | `workflow_call` | — |

Spec: [00-deploy-api.md](../specs/backend/tasks/00-deploy-api.md)

### Deploy (resumo)

1. `npm run test:coverage`
2. Bundle esbuild por package em `resources/{flow}/` → `lambda.zip` (1 por fluxo)
3. Matrix nos 4 fluxos: `products-public`, `orders-public`, `products-admin`, `orders-admin`
4. Por fluxo: `scripts/deploy-flow.sh` → S3 `{flow}/latest.zip` → `update-function-code`
5. Nome da função lido via **SSM** `/afro90s/{env}/lambda-{flow}-name`

## AWS — Role IAM

| Role | Trigger | Policy |
|------|---------|--------|
| `afro90s-github-backend-dev` | push `dev` | `s3:PutObject` em `.../{flow}/*` + `lambda:UpdateFunctionCode` + `ssm:GetParameter` em `/afro90s/dev/*` |
| `afro90s-github-backend-prod` | push `main` | Idem prod |

### Policy inline — `afro90s-github-backend-dev`

> Se a role foi criada com o template antigo (`api/*` + `lambda-api`), **atualize** para o JSON abaixo.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ArtifactsUpload",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::afro90s-dev-s3-lambda-artifacts/*"
    },
    {
      "Sid": "LambdaUpdate",
      "Effect": "Allow",
      "Action": ["lambda:UpdateFunctionCode", "lambda:GetFunction"],
      "Resource": [
        "arn:aws:lambda:us-east-1:083171867610:function:afro90s-dev-lambda-products-public",
        "arn:aws:lambda:us-east-1:083171867610:function:afro90s-dev-lambda-orders-public",
        "arn:aws:lambda:us-east-1:083171867610:function:afro90s-dev-lambda-products-admin",
        "arn:aws:lambda:us-east-1:083171867610:function:afro90s-dev-lambda-orders-admin"
      ]
    },
    {
      "Sid": "SSMLambdaNames",
      "Effect": "Allow",
      "Action": ["ssm:GetParameter"],
      "Resource": "arn:aws:ssm:us-east-1:083171867610:parameter/afro90s/dev/*"
    }
  ]
}
```

### Policy inline — `afro90s-github-backend-prod`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ArtifactsUpload",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::afro90s-prod-s3-lambda-artifacts/*"
    },
    {
      "Sid": "LambdaUpdate",
      "Effect": "Allow",
      "Action": ["lambda:UpdateFunctionCode", "lambda:GetFunction"],
      "Resource": [
        "arn:aws:lambda:us-east-1:083171867610:function:afro90s-prod-lambda-products-public",
        "arn:aws:lambda:us-east-1:083171867610:function:afro90s-prod-lambda-orders-public",
        "arn:aws:lambda:us-east-1:083171867610:function:afro90s-prod-lambda-products-admin",
        "arn:aws:lambda:us-east-1:083171867610:function:afro90s-prod-lambda-orders-admin"
      ]
    },
    {
      "Sid": "SSMLambdaNames",
      "Effect": "Allow",
      "Action": ["ssm:GetParameter"],
      "Resource": "arn:aws:ssm:us-east-1:083171867610:parameter/afro90s/prod/*"
    }
  ]
}
```

## GitHub Environments

### Onde cada valor fica

| Valor | Armazenado em | Lido por |
|-------|---------------|----------|
| `ARTIFACT_BUCKET` | GitHub Environment (copiado do output CDK) | `${{ vars.ARTIFACT_BUCKET }}` |
| Nomes das Lambdas | SSM (criado pelo CDK) | `deploy-flow.sh` → `aws ssm get-parameter` |
| `AWS_ROLE_ARN` | GitHub Environment | `${{ vars.AWS_ROLE_ARN }}` (OIDC) |

### `dev`

| Variable | Exemplo | Origem |
|----------|---------|--------|
| `AWS_ROLE_ARN` | `arn:aws:iam::083171867610:role/afro90s-github-backend-dev` | IAM task 00 |
| `AWS_REGION` | `us-east-1` | fixo |
| `ARTIFACT_BUCKET` | `afro90s-dev-s3-lambda-artifacts` | Output `LambdaArtifactsBucketName` |

### `prod`

Mesmas variables com valores prod + **required reviewers**.

> **Não** adicionar `LAMBDA_FUNCTION_NAME` — são 4 funções; o workflow resolve via SSM.

### Setup pós-deploy infra

1. Rodar `export-outputs.sh dev` no repo infra (ou CloudFormation console)
2. Copiar `LambdaArtifactsBucketName` → Environment `dev` → `ARTIFACT_BUCKET`
3. Repetir para `prod`

## Branch protection — `main`

- Require PR + 1 approval
- Require status check `ci`
- Block force push

## Pré-requisitos

- [x] Infra task 10 deployada (4 Lambdas + bucket artefatos)
- [x] Roles IAM backend com permissão SSM (template atualizado)
- [x] Variables preenchidas nos environments

## Checklist

- [x] `ci.yml` + `deploy-dev.yml` + `deploy-prod.yml` commitados
- [x] `ARTIFACT_BUCKET` configurado em `dev` e `prod`
- [x] Merge em `dev` atualiza as 4 Lambdas
- [x] Nenhum `AWS_ACCESS_KEY_ID` no repo

## Referências

- [Pipeline overview](../specs/pipelines/overview.md)
- [Task 00-deploy-api](../specs/backend/tasks/00-deploy-api.md)
- [Outputs infra (canônico)](https://github.com/kevincrys/afro90sInfra/blob/main/docs/specs/infra/outputs.md)
