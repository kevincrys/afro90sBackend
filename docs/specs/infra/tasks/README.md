# Tasks — Infraestrutura Afro90s (entregas faseadas)

Backlog de implementação CDK organizado em **4 fases** de entrega incremental.
Cada fase é deployável e testável de forma independente.

Conta AWS: `083171867610` | Região: `us-east-1` | Ambientes: `dev` e `prod`

## Legenda de status

| Status | Significado |
|--------|-------------|
| `pendente` | Não iniciada |
| `em andamento` | Em implementação |
| `concluída` | Critérios de conclusão verificados |

## Ordem de execução

**O número da task é a ordem de execução.** Execute sequencialmente: `00 → 01 → 02 → … → 20`.

Cada task depende apenas da anterior (`task N` requer `task N-1` concluída), salvo indicação explícita em contrário no próprio arquivo.

---

## Fase 0 — Fundação

> Pré-requisito para todas as fases. Sem entrega visível, mas sem ela nada roda.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 00 | [00-environments.md](00-environments.md) | Setup repo CDK, OIDC, GitHub (sem CLI local) |
| 01 | [01-cdk-config-deploy.md](01-cdk-config-deploy.md) | `lib/config/{dev,prod}.ts` e scripts npm |
| 02 | [02-cdk-stacks.md](02-cdk-stacks.md) | 5 stacks scaffold em `lib/stacks/` + `bin/app.ts` |
| 03 | [03-tags-naming.md](03-tags-naming.md) | Aspect de tags globais e convenção de naming |
| 04 | [04-cicd.md](04-cicd.md) | 3 workflows GitHub Actions + CDK bootstrap na pipeline |

---

## Fase 1 — Site público

> **Entregável:** site no ar com catálogo de produtos, imagens e formulário de pedido.
> Sem login, sem admin, sem e-mail. `POST /orders` cria pedido no banco, não envia e-mail.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 05 | [05-dynamodb.md](05-dynamodb.md) | Tabelas `products` e `orders` + GSIs (on-demand) |
| 06 | [06-frontend-hosting.md](06-frontend-hosting.md) | S3 web + CloudFront OAC (SPA React) |
| 07 | [07-assets-storage.md](07-assets-storage.md) | S3 assets + behavior `/assets/*` no CloudFront |
| 08 | [08-iam-publica.md](08-iam-publica.md) | Role Lambda pública (sem SES) |
| 09 | [09-ssm-params.md](09-ssm-params.md) | SSM Parameters fase 1 + `.env.example` |
| 10 | [10-api-publica.md](10-api-publica.md) | HTTP API + Lambda + 3 rotas públicas |
| 11 | [11-outputs.md](11-outputs.md) | CfnOutputs + script `export-outputs.sh` |
| 12 | [12-aceite-fase1.md](12-aceite-fase1.md) | Script smoke test fase 1 + checklist aceite |

**✓ Resultado:** `https://*.cloudfront.net` abre o site. `GET /products` e `POST /orders` funcionam.

---

## Fase 2 — Login admin

> **Entregável:** autenticação Cognito funcional. O painel admin ainda não tem rotas, mas o token já é válido.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 13 | [13-cognito.md](13-cognito.md) | User Pool Cognito + App Client + authorizer JWT |
| 14 | [14-aceite-fase2.md](14-aceite-fase2.md) | Checklist aceite: login funcional, token válido |

**✓ Resultado:** admin consegue fazer login e obter token JWT. Rotas admin retornam `404` (sem `401`).

---

## Fase 3 — Rotas admin

> **Entregável:** painel admin completo — CRUD de produtos com upload de imagens e gestão de pedidos.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 15 | [15-iam-admin.md](15-iam-admin.md) | Role Lambda admin (DynamoDB CRUD + S3 write) |
| 16 | [16-api-admin.md](16-api-admin.md) | 8 rotas `/admin/*` + authorizer Cognito aplicado |
| 17 | [17-aceite-fase3.md](17-aceite-fase3.md) | Checklist aceite: CRUD products + orders admin |

**✓ Resultado:** admin faz login, cria produtos, faz upload de imagens, gerencia pedidos.

---

## Fase 4 — Email

> **Entregável:** `POST /orders` passa a enviar e-mail de notificação ao admin via SES.
> SES habilitado — `POST /orders` existia desde a fase 1, apenas sem envio.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 18 | [18-ses.md](18-ses.md) | SES template + SSM e-mail params + IAM SES |
| 19 | [19-observabilidade.md](19-observabilidade.md) | Log groups 14d + dashboard CloudWatch free tier |
| 20 | [20-aceite-fase4.md](20-aceite-fase4.md) | Smoke test completo + checklist aceite v1 final |

**✓ Resultado:** infraestrutura v1 completa. E-mail enviado no pedido. Dashboard CloudWatch ativo.

---

## Cadeia de dependências

| Task | Depende de |
|------|------------|
| 00 | — |
| 01–20 | task anterior (`N-1`) |

## Referências

- [Specs CDK](../cdk.md)
- [Recursos AWS](../resources.md)
- [Outputs](../outputs.md)
- [Pipelines infra](../../pipelines/overview.md)
- [Setup GitHub](../../../foundation/github-pipeline-setup.md)
- [API routes](../../backend/api-routes.md)
