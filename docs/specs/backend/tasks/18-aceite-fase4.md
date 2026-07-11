# Task 18 — Aceite Fase 4 (API completa)

**Fase:** 4 — Email  
**Status:** parcial — código SES OK; validação sandbox pós-deploy (secrets + verify)  
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

- [ ] `POST /orders` → `201` + e-mail recebido (sandbox) — **após** secrets GitHub + verify SES + deploy
- [x] Falha SES simulada → ainda `201` (testes unitários task 16)

### Qualidade

- [x] `npm run test:coverage` ≥ 80%
- [x] Rotas documentadas em `api-routes.md` implementadas
- [x] Logs estruturados JSON com `requestId` (task 19)

### Alinhamento infra

- [x] Deploy via pipeline + CI repo
- [x] Smoke / BDD manuais (exceto INT-01 SES live) executados

## Pré-requisitos

- Tasks 00–17, 19–22 concluídas
- Infra task 18 + secrets + verificação SES para fechar INT-01

## Critérios de conclusão

- [ ] Checklist completo (bloqueado em e-mail live sandbox)
- [ ] Atualizar **Status** para `concluída` — **API v1 completa** (após e-mail live)
