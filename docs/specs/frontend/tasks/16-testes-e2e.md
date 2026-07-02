# Task 16 — Testes E2E (Cypress)

**Fase:** 4 — Qualidade final  
**Status:** pendente

## Objetivo

Implementar testes end-to-end com Cypress cobrindo os fluxos críticos de todas as fases.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Framework E2E | Cypress |
| Unit tests | Vitest (componentes críticos) |
| Mock API | Não — dev é ambiente funcional |
| Ambiente | Apontar para `dev` deployado |

## O que implementar

### Setup Cypress

```bash
npm install -D cypress
```

- [ ] `cypress.config.ts` com `baseUrl` apontando para CloudFront dev
- [ ] `cypress/e2e/` com specs por fase

### Specs E2E

**`cypress/e2e/public-store.cy.ts`** (fase 1):
- [ ] Visitar `/` → catálogo carrega
- [ ] Clicar produto → detalhe abre
- [ ] Adicionar ao carrinho → badge atualiza
- [ ] Abrir drawer → checkout com dados válidos → pedido criado

**`cypress/e2e/admin-auth.cy.ts`** (fase 2):
- [ ] `/admin/pedidos` sem login → redirect `/admin/login`
- [ ] Login com credenciais → redirect `/admin/pedidos`

**`cypress/e2e/admin-crud.cy.ts`** (fase 3):
- [ ] Criar produto → aparece no catálogo
- [ ] Alterar status de pedido

### Testes unitários (Vitest)

- [ ] `formatPrice()` — formatação BRL
- [ ] `cart.store` — add/remove/clear
- [ ] `errorMessages` — mapeamento pt-BR

### CI

- [ ] Adicionar step Cypress no workflow CI (opcional: só em merge para `dev`)

## Pré-requisitos

- Fases 1–3 entregues
- Ambiente `dev` funcional

## Critérios de conclusão

- [ ] Specs E2E passam contra ambiente dev
- [ ] Testes unitários passam
- [ ] Atualizar **Status** para `concluída`
