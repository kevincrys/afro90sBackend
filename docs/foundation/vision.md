# Visão e Escopo — afro90sBackend

## Objetivo

Implementar a **API REST serverless** do Afro90s: handlers Lambda, serviços de negócio, acesso a DynamoDB/S3/SES e testes automatizados.

## Escopo

- Código-fonte da Lambda (Node.js 20 + TypeScript)
- Rotas públicas (`/products`, `/orders`) e admin (`/admin/*`)
- Modelos, validação Zod, tratamento de erros HTTP
- Testes unitários e de integração (Vitest)
- Pipeline CI (build, test, lint) neste repositório
- Specs locais de backend (cópia/ref. da documentação central)

## Fora de escopo

- Provisionamento AWS (CDK, IAM, API Gateway config) → **afro90sInfra**
- Interface web → **afro90sFrontend**
- Decisões arquiteturais globais e ADRs → **afro90sInfra** (alterações de contrato exigem PR lá também)
- Deploy direto da Lambda (feito pelo CDK no afro90sInfra)

## Contratos

| Documento | Uso |
|-----------|-----|
| [api-routes.md](../specs/backend/api-routes.md) | Contrato HTTP — não implementar rotas fora da spec |
| [data-models.md](../specs/backend/data-models.md) | Schemas DynamoDB |
| [overview.md](../specs/backend/overview.md) | Stack e estrutura |

Mudanças de contrato: atualizar spec neste repo **e** no [afro90sInfra](https://github.com/kevincrys/afro90sInfra).

## Princípios

1. **Contrato first** — endpoint novo ou alterado começa na spec `api-routes.md`.
2. **Testes obrigatórios** — cobertura mínima 80%; CI bloqueia merge se falhar.
3. **Sem secrets no Git** — variáveis injetadas pelo CDK no deploy.
4. **Diff mínimo** — uma concern por PR.

## Roadmap

- [ ] Task 00 — setup do repo (estrutura, ESLint, Vitest, CI)
- [ ] Fase 1 — rotas públicas (products, orders)
- [ ] Fase 2 — auth Cognito + rotas admin
- [ ] Fase 3 — upload de imagens, CRUD admin completo
- [ ] Fase 4 — SES, testes de cobertura, aceite final

Tasks: [docs/specs/backend/tasks/](../specs/backend/tasks/)

## Referências

- [Arquitetura global](architecture.md) (cópia local)
- [Visão do produto](project-overview.md)
- [Pipeline CI](../specs/pipelines/overview.md)
- [Setup GitHub](github-pipeline-setup.md)
