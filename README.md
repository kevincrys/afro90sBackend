# afro90sBackend

Repositório da **API serverless** do projeto **Afro90s** — Lambda Node.js 20 + TypeScript, exposta via API Gateway.

## Ecossistema

| Repositório | Função |
|-------------|--------|
| [afro90sInfra](https://github.com/kevincrys/afro90sInfra) | CDK, recursos AWS, specs centrais, deploy de infra + Lambda |
| **afro90sBackend** (este) | Handlers, serviços, modelos, testes |
| [afro90sFrontend](https://github.com/kevincrys/afro90sFrontend) | SPA React consumindo esta API |

## Documentação

### Neste repositório

| Recurso | Descrição |
|---------|-----------|
| [Visão do repositório](docs/foundation/vision.md) | Escopo e responsabilidades |
| [Overview backend](docs/specs/backend/overview.md) | Stack, estrutura, convenções |
| [**Contrato API**](docs/specs/backend/api-routes.md) | Rotas, headers, payloads — fonte da verdade |
| [Modelos de dados](docs/specs/backend/data-models.md) | DynamoDB, schemas Zod |
| [Tasks de implementação](docs/specs/backend/tasks/) | Checklist faseado |
| [**Pipeline CI**](docs/specs/pipelines/overview.md) | GitHub Actions deste repo |
| [**Setup GitHub**](docs/foundation/github-pipeline-setup.md) | Environments, branch rules, OIDC |
| [Guia para agentes](AGENTS.md) | Instruções para assistentes de IA |
| [Como contribuir](CONTRIBUTING.md) | Fluxo de PR e commits |

### Documentação central (afro90sInfra)

Specs de produto, ADRs e arquitetura global vivem em [afro90sInfra](https://github.com/kevincrys/afro90sInfra/tree/main/docs/foundation). Este repo mantém cópia local para referência offline.

## Stack

| Componente | Tecnologia |
|------------|------------|
| Runtime | AWS Lambda Node.js 20 |
| Linguagem | TypeScript (strict) |
| HTTP | Middy + router interno |
| Validação | Zod |
| Banco | DynamoDB |
| Storage | S3 (imagens) |
| E-mail | SES |
| Testes | Vitest (cobertura mín. 80%) |
| Deploy | Via CDK no repo **afro90sInfra** |

## Estrutura (alvo)

```
afro90sBackend/
├── src/
│   ├── handler.ts
│   ├── router.ts
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── utils/
├── test/
├── .github/workflows/
│   └── ci.yml
└── docs/specs/backend/
```

## Pipeline

| Evento | Ação |
|--------|------|
| PR / push | CI: build → test (coverage ≥ 80%) → lint |
| Deploy Lambda | Pipeline do **afro90sInfra** (CDK empacota este código) |

Detalhes: [docs/specs/pipelines/overview.md](docs/specs/pipelines/overview.md)

## Status

- [x] Specs e tasks de backend
- [x] Documentação de pipeline e setup GitHub
- [ ] Implementação do código (`src/`)
- [ ] Workflow `.github/workflows/ci.yml`
- [ ] Integração com deploy CDK no afro90sInfra

## Desenvolvimento local

```bash
npm ci
npm run build
npm test
npm run lint
```

Variáveis de ambiente: ver `.env.example` (a criar na task 00).
