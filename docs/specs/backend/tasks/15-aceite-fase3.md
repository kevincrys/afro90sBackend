# Task 15 — Aceite Fase 3 (Rotas admin)

**Fase:** 3 — Rotas admin  
**Status:** concluída

## Objetivo

Validar CRUD de produtos, upload de imagens e gestão de pedidos com autenticação Cognito.

## Automação

- [x] `scripts/smoke-test-api-fase3.sh` — regressão fases 1–2 + E2E admin (produtos + pedidos); CI pós-deploy (`deploy-reusable.yml`, **não impeditivo** — `continue-on-error`)
- [x] Token válido: E2E automático se `SMOKE_ADMIN_ACCESS_TOKEN` configurado; senão SKIP com aviso
- [x] Rotas `/admin/*` no API GW com authorizer Cognito

## Checklist de aceite

### Produtos

- [x] `POST /admin/products` com token → `201`, produto em `GET /products`
- [x] Imagem acessível via `AssetsCdnUrl` / CloudFront (BDD / aceite manual)
- [x] `PUT /admin/products/{id}` atualiza campos
- [x] `PUT /admin/products/{id}/stock` atualiza quantidade
- [x] `DELETE /admin/products/{id}` remove produto
- [x] `GET /admin/products?q=` busca por ID ou prefixo de nome (task 22)

### Pedidos

- [x] `POST /orders` (público) cria pedido
- [x] `GET /admin/orders` lista o pedido
- [x] `GET /admin/orders?q=` busca por ID ou prefixo de nome (task 20)
- [x] `POST /orders` grava `customerNameLower` (task 20)
- [x] `PUT /admin/orders/{id}` atualiza status

### Auth e regressão

- [x] Rotas admin sem token → `401`
- [x] Rotas públicas da fase 1 continuam OK
- [x] `npm run test:coverage` ≥ 80%

## Pré-requisitos

- Tasks 13, 14, 20, 22 concluídas
- Infra task 17 (aceite fase 3)

## Critérios de conclusão

- [x] Smoke script + CI pós-deploy
- [x] Aceite manual / BDD: login Cognito + fluxo admin completo
- [x] **Status** concluída — fase 3 entregue (backend)
