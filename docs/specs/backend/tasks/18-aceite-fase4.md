# Task 18 — Aceite Fase 4 (API completa)

**Fase:** 4 — Email  
**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar API v1 completa: 3 rotas públicas + 8 rotas admin + e-mail SES + cobertura de testes.

## Checklist de aceite final

### Fase 1 — Público

- [ ] `GET /products`, `GET /products/{id}`, `POST /orders` OK

### Fase 2 — Auth

- [ ] Token Cognito aceito nas rotas admin

### Fase 3 — Admin

- [ ] CRUD produtos + upload imagem + gestão pedidos OK

### Fase 4 — Email

- [ ] `POST /orders` → `201` + e-mail recebido (sandbox)
- [ ] Falha SES simulada → ainda `201`

### Qualidade

- [ ] `npm run test:coverage` ≥ 80%
- [ ] Todas as 11 rotas documentadas em `api-routes.md` implementadas
- [ ] Logs estruturados JSON com `requestId` no CloudWatch

### Alinhamento infra

- [ ] Deploy via pipeline infra (`afro90sInfra`) + CI deste repo (`afro90sBackend`)
- [ ] Smoke test infra `smoke-test-completo.sh` passa

## Pré-requisitos

- Tasks 00–17 concluídas
- Infra task 20 (aceite fase 4) concluída

## Critérios de conclusão

- [ ] Checklist completo
- [ ] Atualizar **Status** para `concluída` — **API v1 completa**
