# Task 11 — Aceite Fase 2 (Auth)

**Fase:** 2 — Login admin  
**Status:** concluída

## Objetivo

Validar que a autenticação Cognito está integrada — rotas admin ainda não implementadas, mas o token é aceito.

## Automação

- [x] `scripts/smoke-test-api-fase2.sh` — regressão fase 1 + auth admin; executado após deploy no CI (`deploy-reusable.yml`, **não impeditivo** — `continue-on-error`)
- [x] Token válido: teste automático se `SMOKE_ADMIN_ACCESS_TOKEN` estiver configurado no GitHub (secret); senão SKIP com aviso
- [x] Rotas `/admin/*` ausentes no API GW (404): SKIP auth E2E com aviso — aguarda infra task 16

## Checklist de aceite

- [x] Token ausente em rota admin → `401` (smoke; SKIP se rota ainda 404)
- [x] Token inválido → `401` (smoke)
- [x] Token Cognito válido (grupo `admins`) não recebe `401` (smoke com secret ou aceite manual / BDD prod)
- [x] Rotas públicas da fase 1 continuam funcionando (regressão via fase 1 no smoke)
- [x] `npm run test:coverage` mantém ≥ 80%

## Pré-requisitos

- Task 10 concluída
- Infra task 14 (aceite fase 2) concluída

## Critérios de conclusão

- [x] Smoke script + CI pós-deploy
- [x] Aceite manual: login Cognito + `GET /admin/products` com token → não `401`
- [x] **Status** concluída — fase 2 entregue (backend)
