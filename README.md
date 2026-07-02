# afro90sInfra

Repositório de infraestrutura e **documentação central** do projeto **Afro90s** — e-commerce com temática anos 90.

## Documentação

### Produto e fundamentação

| Recurso | Descrição |
|---------|-----------|
| [Visão do produto](docs/foundation/project-overview.md) | O que é o Afro90s, domínio, fluxos v1 |
| [Visão do repositório](docs/foundation/vision.md) | Escopo deste repo (infra + specs) |
| [Arquitetura](docs/foundation/architecture.md) | Sistema completo, ambientes, deploy |
| [Glossário](docs/foundation/glossary.md) | Termos do domínio |
| [ADRs](docs/foundation/adr/) | Decisões arquiteturais |

### Esferas de desenvolvimento

| Esfera | Entry point | Destaque |
|--------|-------------|----------|
| **CDK / Infra** | [specs/infra/overview.md](docs/specs/infra/overview.md) | AWS, stacks, recursos, outputs |
| **Backend** | [specs/backend/overview.md](docs/specs/backend/overview.md) | Lambda, DynamoDB, modelos |
| **Frontend** | [specs/frontend/overview.md](docs/specs/frontend/overview.md) | React SPA, UI, integração |
| **API (contrato)** | [specs/backend/api-routes.md](docs/specs/backend/api-routes.md) | **Todas as rotas**, headers, payloads |

### Contribuição e agentes

| Recurso | Descrição |
|---------|-----------|
| [Como contribuir](CONTRIBUTING.md) | Fluxo de trabalho e convenções |
| [Guia para agentes](AGENTS.md) | Instruções para assistentes de IA |

## Estrutura do repositório

```
afro90sInfra/
├── docs/
│   ├── foundation/          # visão, arquitetura, ADRs
│   └── specs/
│       ├── infra/           # CDK, AWS
│       ├── backend/         # API, modelos
│       └── frontend/        # React SPA
├── infra/                   # CDK (a implementar)
└── .cursor/rules/
```

## Stack (definida)

| Camada | Tecnologia |
|--------|------------|
| Cloud | AWS |
| IaC | AWS CDK (TypeScript) |
| Frontend | React + Vite → S3 + CloudFront |
| API | API Gateway + Lambda Node.js 20 |
| Dados | DynamoDB |
| Auth admin | Cognito |
| E-mail | SES |

## Status

- [x] Documentação de produto, arquitetura e specs (3 esferas)
- [x] ADRs de stack (002–006)
- [ ] Implementação CDK em `infra/`
- [ ] Pipeline CI/CD
- [ ] Repos de aplicação (`afro90s-api`, `afro90s-web`)
