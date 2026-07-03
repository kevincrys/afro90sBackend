# Task 17 — Testes e cobertura

**Fase:** 4 — Email  
**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Garantir cobertura mínima de **80% agregada** no monorepo e documentar estratégia de testes.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Framework | Vitest (raiz — projects por package) |
| Cobertura mínima | 80% lines + branches (agregado) |
| Integração | DynamoDB Local para rotas críticas |
| Mock SES/S3 | `@aws-sdk` mocks nos unitários |

## O que implementar

### Estrutura de testes

```
afro90sBackend/
├── vitest.config.ts           # projects: libs/*, resources/*
├── libs/
│   ├── models/src/**/*.test.ts
│   ├── http/src/**/*.test.ts
│   └── services/src/**/*.test.ts
├── resources/
│   ├── products-public/src/**/*.test.ts
│   └── orders-public/src/**/*.test.ts
└── test/integration/          # opcional — fluxos E2E locais
```

- [ ] `vitest.config.ts` com `projects` ou `workspace` coverage merge
- [ ] Threshold `coverage: { lines: 80, branches: 80 }` na raiz
- [ ] CI: `npm run test:coverage` falha abaixo do threshold

### Testes por camada

- [ ] Unit: libs (`models`, `http`, `services`, `repositories`)
- [ ] Unit: handlers/rotas em cada `resources/{flow}`
- [ ] Integration: `POST /orders` (DynamoDB Local)
- [ ] Integration: CRUD admin products

## Pré-requisitos

- Tasks 00–16 concluídas

## Critérios de conclusão

- [ ] `npm run test:coverage` ≥ 80% agregado
- [ ] CI bloqueia merge abaixo do threshold
- [ ] `overview.md` atualizado
- [ ] Atualizar **Status** para `concluída`
