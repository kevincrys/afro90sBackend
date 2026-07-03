# Arquitetura — Afro90s

> Documento vivo. Atualize quando ADRs ou specs alterarem a arquitetura.

## Visão geral do sistema

```
┌──────────────┐     HTTPS      ┌─────────────┐     OAC      ┌──────────────┐
│   Browser    │ ──────────────►│  CloudFront │ ────────────►│  S3 (SPA)    │
│  React SPA   │                └─────────────┘              └──────────────┘
└──────┬───────┘
       │ HTTPS (API)
       ▼
┌─────────────┐     invoke     ┌──────────────┐     read/write   ┌────────────┐
│ API Gateway │ ──────────────►│   Lambda     │ ────────────────►│ DynamoDB   │
│  HTTP API   │                │  (Node 24)   │                  │ products   │
└─────────────┘                └──────┬───────┘                  │ orders     │
       │                              │                          └────────────┘
       │ Cognito JWT                  ├──► SES (e-mail pedido)
       │ (rotas /admin/*)             └──► S3 (upload imagens)
       ▼
┌─────────────┐
│   Cognito   │
│  User Pool  │
└─────────────┘

Browser ──► wa.me (WhatsApp) — v1 via link no frontend
```

## Repositório afro90sInfra

```
afro90sInfra/
├── docs/
│   ├── foundation/          # visão, arquitetura, ADRs
│   └── specs/               # infra, backend, frontend
├── infra/                   # CDK (a implementar)
│   ├── bin/app.ts
│   └── lib/stacks/
└── .cursor/rules/
```

Provisiona recursos AWS nos ambientes **`dev`** e **`production`** (v1). Ambiente `staging` fica fora do escopo inicial e pode ser introduzido depois via ADR.

## Ambientes

| Ambiente | Propósito | Isolamento |
|----------|-----------|------------|
| **dev** | Desenvolvimento, testes e validação de integração | Conta ou stack isolada de production |
| **production** | Tráfego real | Máximo isolamento e controle de mudanças |

Naming: `afro90s-{env}-{tipo}-{nome}` (ex.: `afro90s-dev-ddb-products`).

Detalhes de recursos: [spec de infra](../specs/infra/resources.md).

## Camadas

### 1. Edge / Frontend

- S3 bucket privado para build estático da SPA
- CloudFront com fallback `index.html` (roteamento client-side)
- Bucket S3 separado para **imagens de produtos** (URLs públicas via CloudFront ou presigned)

### 2. API (serverless)

- API Gateway HTTP API
- Lambdas por domínio: produtos (público), pedidos (público), admin (protegido)
- CORS restrito ao domínio CloudFront do frontend

### 3. Dados

- DynamoDB `products` — catálogo
- DynamoDB `orders` — pedidos
- S3 `assets` — imagens enviadas no CRUD admin

### 4. Identidade

- Cognito User Pool para admins
- JWT authorizer nas rotas `/admin/*`
- Sem autenticação de cliente na v1 ([ADR-005](adr/005-admin-auth-v1.md))

### 5. Notificações

- SES — e-mail ao admin quando novo pedido é criado
- WhatsApp — link `wa.me` no frontend ([ADR-006](adr/006-whatsapp-integration.md))

### 6. Observabilidade

- CloudWatch Logs (Lambdas)
- Métricas API Gateway e Lambda
- Alarmes básicos em production (a detalhar na implementação CDK)

## Fluxo de pedido

```
Cliente          Frontend           API              DynamoDB    SES        WhatsApp
   │                │                 │                  │         │            │
   │── checkout ───►│                 │                  │         │            │
   │                │── POST /orders ─►│                  │         │            │
   │                │                 │── put order ────►│         │            │
   │                │                 │── send email ──────────────►│            │
   │                │◄── 201 ─────────│                  │         │            │
   │◄── confirmação │                 │                  │         │            │
   │── abre link ───────────────────────────────────────────────────────────────►│
```

## Rotas da API

Separação público vs admin documentada em [api-routes.md](../specs/backend/api-routes.md).

| Grupo | Prefixo | Auth |
|-------|---------|------|
| Público | `/products`, `/orders` | Nenhuma |
| Admin | `/admin/*` | Cognito JWT |

## Fluxo de deploy (alvo)

```
PR → CI (lint, synth, diff) → Review → Merge → CD (deploy dev) → Promo manual → production
```

Implementação: GitHub Actions + `cdk deploy`. Ver [spec CDK](../specs/infra/cdk.md).

## Decisões registradas

| ADR | Título | Status |
|-----|--------|--------|
| [001](adr/001-repo-structure.md) | Estrutura de documentação do repositório | Aceito |
| [002](adr/002-aws-cloud-provider.md) | AWS como cloud provider | Aceito |
| [003](adr/003-cdk-iac.md) | AWS CDK para IaC | Aceito |
| [004](adr/004-serverless-architecture.md) | API Gateway + Lambda + DynamoDB | Aceito |
| [005](adr/005-admin-auth-v1.md) | Autenticação admin-only v1 | Aceito |
| [006](adr/006-whatsapp-integration.md) | Integração WhatsApp | Proposto |

## Referências

- [Visão do produto](project-overview.md)
- [Spec infra](../specs/infra/overview.md)
- [API routes](../specs/backend/api-routes.md)
