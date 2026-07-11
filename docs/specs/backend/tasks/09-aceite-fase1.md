# Task 09 — Aceite Fase 1 (API pública)

**Fase:** 1 — API pública  
**Status:** concluída  
**Arquivos alvo:** `[overview.md](../overview.md)`

## Objetivo

Validar que as 3 rotas públicas funcionam end-to-end em `dev`, alinhadas com a infra fase 1.

## Automação

- [x] `scripts/smoke-test-api-fase1.sh` — executado após deploy no CI (`deploy-reusable.yml`)
- [x] Infra: `infra/scripts/smoke-test-fase1.sh` (API + CloudFront)

## Checklist de aceite

- [x] `GET /products` → `200` com `{ items: [...] }` (coberto no smoke)
- [x] `GET /products?name=…` → `200` (coberto no smoke)
- [x] `GET /products/{id}` UUID inválido → `400` (coberto no smoke)
- [x] `GET /products/{id}` inexistente → `404` (coberto no smoke)
- [x] `POST /orders` body inválido → `400` (coberto no smoke)
- [x] `POST /orders` válido → `201` (smoke SKIP se catálogo vazio; seed + re-run)
- [x] `GET /admin/products` → `404` ou `403` (warn no smoke — OK fase 1)
- [x] Headers `Content-Type` e `X-Request-Id` em todas as respostas
- [x] CORS headers para origem CloudFront (browser / BDD)
- [x] `npm run test:coverage` ≥ 80% nas rotas da fase 1
- [x] Deploy via CI do repo `afro90sBackend` (S3 + `update-function-code`)

## Pré-requisitos

- Tasks 00–08 concluídas
- Infra task 12 (scripts smoke) concluída

## Critérios de conclusão

- [x] Smoke script + CI pós-deploy
- [x] Aceite manual pós-deploy (CORS, browser / BDD)
- [x] **Status** concluída
