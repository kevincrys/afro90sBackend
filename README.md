# afro90sBackend

Repositório da **API serverless** do projeto **Afro90s** — Lambda Node.js 20 + TypeScript, exposta via API Gateway.

## Ecossistema

| Repositório | Função |
|-------------|--------|
| [afro90sInfra](https://github.com/kevincrys/afro90sInfra) | CDK, recursos AWS, Lambda config (env, IAM) |
| **afro90sBackend** (este) | Handlers, bundle, deploy código (S3 + Lambda) |
| [afro90sFrontend](https://github.com/kevincrys/afro90sFrontend) | SPA React consumindo esta API |

## Documentação

| Recurso | Descrição |
|---------|-----------|
| [Visão do repositório](docs/foundation/vision.md) | Escopo e responsabilidades |
| [Overview backend](docs/specs/backend/overview.md) | Stack, estrutura |
| [**Contrato API**](docs/specs/backend/api-routes.md) | Rotas, headers, payloads |
| [**Pipeline CI/CD**](docs/specs/pipelines/overview.md) | CI + deploy S3/Lambda |
| [**Setup GitHub**](docs/foundation/github-pipeline-setup.md) | Environments, OIDC, roles |
| [Task deploy](docs/specs/backend/tasks/00-deploy-api.md) | Implementação dos workflows |
| [Guia para agentes](AGENTS.md) | Instruções para IA |
| [Como contribuir](CONTRIBUTING.md) | Fluxo de PR |

## Stack

| Componente | Tecnologia |
|------------|------------|
| Runtime | AWS Lambda Node.js 20 |
| Linguagem | TypeScript (strict) |
| HTTP | Middy + router interno |
| Bundle | esbuild (`npm run bundle`) |
| Deploy | S3 + `update-function-code` ([ADR-007](https://github.com/kevincrys/afro90sInfra/blob/main/docs/foundation/adr/007-backend-lambda-s3-deploy.md)) |
| Testes | Vitest (cobertura ≥ 80%) |

## Pipeline

| Evento | Ação |
|--------|------|
| PR / push | CI: build → test → lint |
| Push `dev` | Deploy Lambda dev (S3 + update-function-code) |
| Push `main` | Deploy Lambda production |

## Estrutura (alvo)

```
afro90sBackend/
├── src/handler.ts
├── scripts/bundle.mjs
├── .github/workflows/
│   ├── ci.yml
│   ├── deploy-dev.yml
│   └── deploy-prod.yml
└── docs/specs/
```

## Status

- [x] Specs e ADR-007 (deploy S3)
- [ ] Implementação `src/`
- [ ] Workflows GitHub Actions
- [ ] Primeiro deploy em dev

## Desenvolvimento local

```bash
npm ci
npm run build
npm test
npm run bundle   # gera dist/ para deploy
```
