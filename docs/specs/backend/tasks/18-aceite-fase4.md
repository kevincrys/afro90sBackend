# Task 18 — Aceite Fase 4 (API completa)

**Fase:** 4 — Email  
**Status:** parcial — API e qualidade OK; **SES pendente** (task 16)  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar API v1 completa: 3 rotas públicas + rotas admin + e-mail SES + cobertura de testes.

## Checklist de aceite final

### Fase 1 — Público

- [x] `GET /products`, `GET /products/{id}`, `POST /orders` OK

### Fase 2 — Auth

- [x] Token Cognito aceito nas rotas admin

### Fase 3 — Admin

- [x] CRUD produtos + upload imagem + gestão pedidos OK (incl. busca `q`)

### Fase 4 — Email

- [ ] `POST /orders` → `201` + e-mail recebido (sandbox) — **pendente task 16**
- [ ] Falha SES simulada → ainda `201` — **pendente task 16**

### Qualidade

- [x] `npm run test:coverage` ≥ 80%
- [x] Rotas documentadas em `api-routes.md` implementadas (exceto fluxo SES)
- [x] Logs estruturados JSON com `requestId` (task 19)

### Alinhamento infra

- [x] Deploy via pipeline + CI repo
- [x] Smoke / BDD manuais (exceto SES) executados

## Pré-requisitos

- Tasks 00–15, 17, 19–22 concluídas
- Task 16 (SES) + infra task 18/20 para fechar e-mail

## Critérios de conclusão

- [ ] Checklist completo (bloqueado em SES)
- [ ] Atualizar **Status** para `concluída` — **API v1 completa** (após SES)
