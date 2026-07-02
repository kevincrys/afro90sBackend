# Task 17 — Testes e cobertura

**Fase:** 4 — Email  
**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Garantir cobertura mínima de 80% e documentar estratégia de testes do `afro90s-api`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Framework | Vitest |
| Cobertura mínima | 80% |
| Integração | DynamoDB Local para rotas críticas |
| OpenAPI | Gerar a partir da spec (v1) |
| Mock SES/S3 | `@aws-sdk` mocks nos unitários |

## O que implementar

### Estrutura de testes

```
test/
├── unit/
│   ├── models/          # schemas Zod
│   ├── utils/           # pagination, errors, response
│   ├── services/        # product, order, image, email
│   └── routes/          # handlers isolados
└── integration/
    ├── products.test.ts
    └── orders.test.ts
```

- [ ] `vitest.config.ts` com threshold `coverage: { lines: 80, branches: 80 }`
- [ ] CI falha se cobertura < 80%

### Testes por camada

- [ ] Unit: todos os services e utils
- [ ] Unit: cada handler de rota com event mock
- [ ] Integration: fluxo `POST /orders` completo (DynamoDB Local)
- [ ] Integration: CRUD admin products

### OpenAPI (opcional v1)

- [ ] Script ou comentários JSDoc para gerar spec OpenAPI futuramente

## Pré-requisitos

- Tasks 00–16 concluídas

## Critérios de conclusão

- [ ] `npm run test:coverage` ≥ 80% em lines e branches
- [ ] CI do repo `afro90s-api` bloqueia merge abaixo do threshold
- [ ] `overview.md` atualizado com estratégia de testes
- [ ] Atualizar **Status** para `concluída`
