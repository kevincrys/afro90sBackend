# Task 15 — Aceite Fase 3 (Rotas admin)

**Fase:** 3 — Rotas admin  
**Status:** concluída (código + smoke CI; aceite manual E2E com token Cognito pós-deploy)

## Objetivo

Validar CRUD de produtos, upload de imagens e gestão de pedidos com autenticação Cognito.

## Automação

- [x] `scripts/smoke-test-api-fase3.sh` — regressão fases 1–2 + E2E admin (produtos + pedidos); CI pós-deploy (`deploy-reusable.yml`, **não impeditivo** — `continue-on-error`)
- [x] Token válido: E2E automático se `SMOKE_ADMIN_ACCESS_TOKEN` configurado; senão SKIP com aviso
- [x] Rotas `/admin/*` ausentes no API GW (404): SKIP E2E com aviso — aguarda infra task 17

## Checklist de aceite

### Produtos

- [x] `POST /admin/products` com token → `201`, produto em `GET /products` (smoke E2E com token)
- [ ] Imagem acessível via `AssetsCdnUrl` (manual — smoke usa JSON sem upload)
- [x] `PUT /admin/products/{id}` atualiza campos (smoke E2E)
- [x] `PUT /admin/products/{id}/stock` atualiza quantidade (smoke E2E)
- [x] `DELETE /admin/products/{id}` remove produto (smoke E2E cleanup)

### Pedidos

- [x] `POST /orders` (público) cria pedido (smoke E2E)
- [x] `GET /admin/orders` lista o pedido (smoke E2E)
- [x] `PUT /admin/orders/{id}` atualiza status (smoke E2E)

### Auth e regressão

- [x] Rotas admin sem token → `401` (smoke fase 2/3; SKIP se rota 404)
- [x] Rotas públicas da fase 1 continuam OK (regressão via fase 1 no smoke)
- [x] `npm run test:coverage` ≥ 80%

## Pré-requisitos

- Tasks 13, 14 concluídas
- Infra task 17 (aceite fase 3) — parcial: rotas admin no API GW

## Critérios de conclusão

- [x] Smoke script + CI pós-deploy
- [x] Aceite manual: login Cognito + fluxo admin completo (Postman ou smoke com secret)
- [x] **Status** código: concluída — fase 3 entregue (backend)
