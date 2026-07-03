# Spec: Infraestrutura — Overview

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Definir requisitos de alto nível para a infraestrutura Afro90s antes e durante a implementação em CDK.

## Requisitos

### Ambientes

- [x] Dois ambientes na v1: `dev`, `production`
- [ ] Isolamento entre ambientes (conta, stack ou equivalente)
- [x] Naming convention: `afro90s-{env}-{tipo}-{nome}`

> `staging` não faz parte do escopo inicial. Adicionar depois exige ADR e atualização desta spec.

### Segurança

- [x] Nenhum secret commitado no repositório
- [ ] IAM/policies com least privilege
- [x] Tags obrigatórias em recursos: `project=afro90s`, `env`, `managed-by=afro90sInfra`

### CI/CD

- [ ] Pipeline executa validação em todo PR
- [ ] `cdk diff` automático em PRs que alteram IaC
- [ ] `cdk deploy` em `dev` após merge; `production` com aprovação manual

### Outputs para aplicações

- [x] Documentar outputs exportados ([outputs.md](outputs.md))
- [ ] Variáveis de ambiente injetadas via CI ou SSM

## Stack

| Componente | Decisão | ADR |
|------------|---------|-----|
| Cloud | **AWS** | [002](../../foundation/adr/002-aws-cloud-provider.md) |
| IaC | **AWS CDK (TypeScript)** | [003](../../foundation/adr/003-cdk-iac.md) |
| API / Compute | **API Gateway HTTP + Lambda Node.js 20** | [004](../../foundation/adr/004-serverless-architecture.md) |
| Banco | **DynamoDB on-demand** | [004](../../foundation/adr/004-serverless-architecture.md) |
| Auth admin | **Cognito User Pool** | [005](../../foundation/adr/005-admin-auth-v1.md) |
| E-mail | **SES** | [004](../../foundation/adr/004-serverless-architecture.md) |
| Frontend host | **S3 + CloudFront** | [004](../../foundation/adr/004-serverless-architecture.md) |
| CI | **GitHub Actions** | — |
| Secrets | **AWS Secrets Manager / SSM Parameter Store** | — |

## Specs detalhadas

| Documento | Conteúdo |
|-----------|----------|
| [cdk.md](cdk.md) | Estrutura do projeto CDK, stacks, deploy |
| [resources.md](resources.md) | Recursos AWS por serviço |
| [outputs.md](outputs.md) | Contrato de outputs para apps |
| [tasks/README.md](tasks/README.md) | Backlog de refinamento por tarefa |

## Critérios de aceite (fase 1)

1. Ambiente `dev` provisionável via CDK a partir deste repo — **código concluído (tasks 05–12)**
2. Documentação de outputs disponível para devs de aplicação — **concluído**
3. Pipeline de CI com validate + diff funcionando — **concluído**
4. Aceite runtime (API 200/404/201, SPA no browser) — **pendente** até `cdk deploy` + deploy do `afro90sBackend`

### Status fase 1 (2025-06-23)

| Task | Descrição | Código |
|------|-----------|--------|
| 05 | DynamoDB on-demand + GSIs + TTL | ✅ |
| 06 | S3 web + CloudFront SPA | ✅ |
| 07 | S3 assets + behavior CF | ✅ |
| 08 | IAM role Lambda pública | ✅ |
| 09 | SSM Parameter Store fase 1 | ✅ |
| 10 | HTTP API + Lambda placeholder + rotas | ✅ |
| 11 | CfnOutputs + export-outputs.sh | ✅ |
| 12 | Smoke test + checklist | ✅ (script/CI; aceite manual pós-deploy) |

## Referências

- [Arquitetura](../../foundation/architecture.md)
- [API routes](../backend/api-routes.md)
