# Task 00-deploy — CI/CD deploy da API (S3 + Lambda)

**Fase:** 0 — Fundação  
**Status:** em progresso  
**Repo:** `afro90sBackend`  
**ADR:** [007-backend-lambda-s3-deploy.md](../../../foundation/adr/007-backend-lambda-s3-deploy.md) · [008-backend-monorepo-lerna.md](../../../foundation/adr/008-backend-monorepo-lerna.md)

## Objetivo

Pipelines de **deploy do código Lambda**: bundle esbuild **por package** em `resources/{flow}/`, upload S3 e `update-function-code` nas **4 funções**.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Bundle | esbuild — **1 zip por fluxo** (`resources/{flow}/`) |
| Artefato | `lambda.zip` com `handler.js` na raiz (`handler.handler`) |
| Bucket | `afro90s-{env}-s3-lambda-artifacts` (infra) |
| Chaves S3 | `{flow}/{git-sha}.zip` + `{flow}/latest.zip` |
| Fluxos | `products-public`, `orders-public`, `products-admin`, `orders-admin` |
| Auth AWS | OIDC — `afro90s-github-backend-{dev\|prod}` |
| Trigger dev | Push em `dev` |
| Trigger prod | Push em `main` + environment `prod` |

## Onde ficam bucket e nomes das funções

| Valor | Fonte (AWS) | Onde o CI lê |
|-------|-------------|--------------|
| `ARTIFACT_BUCKET` | Output CDK `LambdaArtifactsBucketName` | GitHub Environment `vars.ARTIFACT_BUCKET` |
| Nomes das Lambdas | SSM `/afro90s/{env}/lambda-{flow}-name` | `scripts/deploy-flow.sh` |

> **Não** configurar `LAMBDA_FUNCTION_NAME` no GitHub.

## Onde configurar (GitHub)

**Settings → Environments** → `dev` / `prod`:

| Variable | Exemplo dev |
|----------|-------------|
| `AWS_ROLE_ARN` | `arn:aws:iam::083171867610:role/afro90s-github-backend-dev` |
| `AWS_REGION` | `us-east-1` |
| `ARTIFACT_BUCKET` | `afro90s-dev-s3-lambda-artifacts` |

## O que implementar

### Scripts

- [ ] `scripts/bundle.mjs` — arg `{flow}` → esbuild `resources/{flow}/src/handler.ts` → `resources/{flow}/dist/handler.js`
- [ ] `scripts/package-lambda.mjs` — zip do `dist/` do fluxo → `resources/{flow}/lambda.zip` (ou temp no CI)
- [x] `scripts/flows.sh` — lista canônica dos 4 fluxos
- [x] `scripts/deploy-flow.sh` — S3 + `update-function-code` + wait (SSM)

### `package.json` (raiz)

- [ ] `"bundle": "node scripts/bundle.mjs"` — todos os fluxos
- [ ] `"bundle:flow": "node scripts/bundle.mjs"` — aceita `--flow=products-public`

### Workflows

- [x] `deploy-reusable.yml` — build (test + bundle all flows) + matrix deploy
- [x] `deploy-dev.yml` / `deploy-prod.yml`

Build (por fluxo no CI):

```bash
node scripts/bundle.mjs products-public
node scripts/package-lambda.mjs products-public
```

Deploy (matrix):

```bash
bash scripts/deploy-flow.sh "${FLOW}" dev "resources/${FLOW}/lambda.zip"
```

### Contrato do zip (infra)

```
lambda.zip
└── handler.js    # exports.handler — runtime handler.handler
```

## Pré-requisitos

- [00-setup-repo.md](00-setup-repo.md) — monorepo + 4 packages em `resources/`
- Infra task 10 (4 Lambdas + bucket)
- Roles IAM backend com S3 `{flow}/*`, 4 funções, `ssm:GetParameter`

## Critérios de conclusão

- [ ] Merge em `dev` publica 4 zips e atualiza as 4 Lambdas
- [ ] `{flow}/{sha}.zip` retido para rollback
- [ ] Merge em `main` deploya prod com approval
- [ ] Nenhum `AWS_ACCESS_KEY_ID` no repositório
- [ ] Atualizar **Status** para `concluída`

## Rollback

```bash
FLOW=products-public
FN=$(aws ssm get-parameter --name /afro90s/dev/lambda-${FLOW}-name --query Parameter.Value --output text)
aws s3 cp s3://BUCKET/${FLOW}/COMMIT_ANTERIOR.zip s3://BUCKET/${FLOW}/latest.zip
aws lambda update-function-code --function-name "$FN" --s3-bucket BUCKET --s3-key ${FLOW}/latest.zip
```

## Referências

- [github-pipeline-setup.md](../../../foundation/github-pipeline-setup.md)
- [pipelines/overview.md](../../pipelines/overview.md)
- [overview.md](../overview.md)
