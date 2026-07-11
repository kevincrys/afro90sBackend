# Task 17 — Testes e cobertura

**Fase:** 4 — Email (qualidade transversal)  
**Status:** concluída (unitários + threshold CI; DynamoDB Local / OpenAPI opcionais)  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Garantir cobertura mínima de 80% e documentar estratégia de testes do `afro90sBackend`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Framework | Vitest |
| Cobertura mínima | 80% |
| Integração | Unitários com mocks AWS SDK; DynamoDB Local opcional |
| OpenAPI | Opcional v1 |
| Mock SES/S3 | `@aws-sdk` mocks nos unitários |

## O que implementar

### Estrutura de testes

Testes colocalizados (`*.test.ts` em `libs/` e `resources/`) — padrão do monorepo.

- [x] `vitest.config.ts` com threshold `coverage: { lines: 80, … }`
- [x] CI falha se cobertura < 80%

### Testes por camada

- [x] Unit: models, utils, pagination, http, repositories, handlers
- [x] Unit: cada fluxo de rota com event mock
- [ ] Integration: DynamoDB Local (opcional — não bloqueia v1)
- [x] CRUD admin products / orders cobertos em unitários + smoke/BDD

### OpenAPI (opcional v1)

- [ ] Script ou comentários JSDoc para gerar spec OpenAPI futuramente

## Pré-requisitos

- Tasks 00–15 concluídas

## Critérios de conclusão

- [x] `npm run test:coverage` ≥ 80% em lines e branches
- [x] CI do repo bloqueia merge abaixo do threshold
- [x] Estratégia de testes refletida no monorepo (Vitest + smoke)
- [x] **Status** concluída (OpenAPI / DynamoDB Local fora do caminho crítico)
