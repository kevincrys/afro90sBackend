# afro90sBackend

Repositório da **API serverless** do projeto **Afro90s** — monorepo Lerna (4 Lambdas + libs compartilhadas), Node.js 20 + TypeScript.

## Ecossistema

| Repositório | Função |
|-------------|--------|
| [afro90sInfra](https://github.com/kevincrys/afro90sInfra) | CDK, recursos AWS, Lambda config (env, IAM) |
| **afro90sBackend** (este) | `resources/` + `libs/`, bundle, deploy S3 |
| [afro90sFrontend](https://github.com/kevincrys/afro90sFrontend) | SPA React |

## Documentação

| Recurso | Descrição |
|---------|-----------|
| [ADR-008 — monorepo](docs/foundation/adr/008-backend-monorepo-lerna.md) | `resources/` + `libs/` + Lerna |
| [Overview backend](docs/specs/backend/overview.md) | Stack, estrutura, mapeamento de paths |
| [**Contrato API**](docs/specs/backend/api-routes.md) | Rotas, headers, payloads |
| [**Pipeline CI/CD**](docs/specs/pipelines/overview.md) | CI + deploy por fluxo |
| [**Setup GitHub**](docs/foundation/github-pipeline-setup.md) | Environments, OIDC, roles |
| [Guia para agentes](AGENTS.md) | Instruções para IA |

## Stack

| Componente | Tecnologia |
|------------|------------|
| Monorepo | Lerna + npm workspaces |
| Runtime | AWS Lambda Node.js 20 |
| HTTP | Middy (por package em `resources/`) |
| Bundle | esbuild por fluxo |
| Deploy | S3 + `update-function-code` × 4 ([ADR-007](docs/foundation/adr/007-backend-lambda-s3-deploy.md)) |
| Testes | Vitest (cobertura ≥ 80% agregada) |

## Estrutura

```
afro90sBackend/
├── lerna.json
├── libs/                    # @afro90s/models, @afro90s/http, …
├── resources/               # 1 pasta = 1 Lambda = 1 fluxo de deploy
│   ├── products-public/
│   ├── orders-public/
│   ├── products-admin/
│   └── orders-admin/
├── scripts/
└── .github/workflows/
```

## Desenvolvimento local

```bash
npm ci
npm run build          # lerna run build
npm test
npm run bundle -- --flow=products-public
```

## Configuração GitHub (deploy)

Environments `dev` / `prod`: `AWS_ROLE_ARN`, `AWS_REGION`, `ARTIFACT_BUCKET` — ver [github-pipeline-setup.md](docs/foundation/github-pipeline-setup.md).

Nomes das Lambdas: **SSM** em runtime (`deploy-flow.sh`).

## Status

- [x] Specs monorepo (ADR-008)
- [ ] Monorepo Lerna implementado (task 00-setup-repo)
- [x] Workflows deploy (matrix 4 fluxos)
- [ ] Primeiro deploy em dev
