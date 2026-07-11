# Task 00-deploy — CI/CD deploy da API (S3 + Lambda)

**Fase:** 0 — Fundação  
**Status:** concluída  
**Repo:** `afro90sBackend`  
**ADR:** [007-backend-lambda-s3-deploy.md](../../../foundation/adr/007-backend-lambda-s3-deploy.md)

## Objetivo

Configurar pipelines de **deploy do código Lambda** neste repositório: bundle via esbuild (por fluxo), upload para S3 e `update-function-code`. A infra (CDK) provisiona bucket e 4 funções; este repo publica o código.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Bundle | esbuild (`npm run bundle:{flow}`) |
| Artefato | `{flow}.zip` por fluxo |
| Bucket | `afro90s-{env}-s3-lambda-artifacts` (criado pela infra) |
| Chaves S3 | `{flow}/{git-sha}.zip` + `{flow}/latest.zip` |
| Fluxos | `products-public`, `orders-public`, `products-admin`, `orders-admin` |
| Auth AWS | OIDC — role `afro90s-github-backend-{dev\|prod}` |
| Trigger dev | Push em branch `dev` |
| Trigger prod | Push em branch `main` + environment `prod` |

## O que implementar

### Scripts `package.json`

- [ ] `"bundle:products-public"`, `"bundle:orders-public"`, etc. — esbuild por entrypoint de fluxo
- [ ] `"package:lambda:{flow}"` — zip cross-platform
- [ ] Manter `"build": "tsc --noEmit"` para CI typecheck (separado do bundle)

### `.github/workflows/deploy-dev.yml`

- [ ] Trigger: `push` em `dev`
- [ ] `environment: dev`
- [ ] Permissions: `id-token: write`, `contents: read`
- [ ] Steps (por fluxo alterado ou matrix nos 4 fluxos):
  1. Checkout
  2. Node 24 + `npm ci`
  3. `npm run test:coverage`
  4. Bundle + zip por fluxo
  5. `configure-aws-credentials` com `${{ vars.AWS_ROLE_ARN }}`
- [x] `scripts/deploy-flow.sh` — SSM + S3 + `update-function-code` por fluxo

Fluxo por matrix item:

```bash
bash scripts/deploy-flow.sh "${FLOW}" dev lambda.zip
```

### `.github/workflows/deploy-prod.yml`

- [ ] Trigger: `push` em `main`
- [ ] `environment: prod`
- [ ] Steps idênticos ao deploy-dev com variables/paths de prod

### Variables GitHub (por environment)

| Variable | Exemplo dev |
|----------|-------------|
| `AWS_ROLE_ARN` | `arn:aws:iam::083171867610:role/afro90s-github-backend-dev` |
| `AWS_REGION` | `us-east-1` |
| `ARTIFACT_BUCKET` | `afro90s-dev-s3-lambda-artifacts` |

Nomes das funções: SSM `/afro90s/{env}/lambda-{flow}-name` (ver [outputs.md](../../infra/outputs.md)).

## Setup inicial (GitHub)

Após deploy infra task 10:

1. `bash infra/scripts/export-outputs.sh dev`
2. Copiar `LambdaArtifactsBucketName` → GitHub `afro90sBackend` → Environment `dev` → `ARTIFACT_BUCKET`
3. Repetir para `prod`
4. Não é necessário configurar nomes das Lambdas no GitHub — o workflow lê do SSM

## Pré-requisitos

- Task [00-setup-repo.md](00-setup-repo.md) concluída (estrutura + CI)
- Infra task 10 (API + bucket artefatos + 4 Lambdas placeholder) deployada
- Roles IAM backend criadas (infra task 00)

## Critérios de conclusão

- [ ] Merge em `dev` publica zip no S3 e Lambdas respondem com código novo
- [ ] `{flow}/{sha}.zip` retido no bucket para rollback manual
- [ ] Merge em `main` deploya em prod (GitHub Environment `prod`) com approval do environment
- [ ] Nenhum `AWS_ACCESS_KEY_ID` no repositório
- [ ] Atualizar **Status** para `concluída`

## Rollback

```bash
FLOW=products-public
aws s3 cp s3://BUCKET/${FLOW}/COMMIT_ANTERIOR.zip s3://BUCKET/${FLOW}/latest.zip
aws lambda update-function-code \
  --function-name FUNCTION \
  --s3-bucket BUCKET \
  --s3-key ${FLOW}/latest.zip
```

## Referências

- [github-pipeline-setup.md](../../../foundation/github-pipeline-setup.md)
- [pipelines/overview.md](../../pipelines/overview.md)
- [infra task 10-api-publica.md](../../infra/tasks/10-api-publica.md)
