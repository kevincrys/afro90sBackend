# Task 13 — Rotas admin de produtos

**Fase:** 3 — Rotas admin  
**Status:** concluída (código; aguarda revisão + deploy infra task 16)

## Objetivo

Implementar CRUD completo de produtos nas rotas `/admin/products*`.

## O que implementar

### `resources/products-admin/src/routes/*`

- [x] `GET /admin/products` — listagem com `name?`, `category?`, `cursor`, `limit`
- [x] `POST /admin/products` — criar produto + imagens (`PhotoInput`: url, base64, stream/multipart)
- [x] `GET /admin/products/{id}` — detalhe
- [x] `PUT /admin/products/{id}` — atualizar campos
- [x] `DELETE /admin/products/{id}` — remover produto e imagens CDN do S3
- [x] `PATCH /admin/products/{id}/stock` — ajuste por `delta` ([api-routes.md](../api-routes.md))

Todas com middleware auth (task 10).

### Serviços

- [x] `services/product.service.ts` — create, update, delete, updateStock
- [x] `services/photo-input.service.ts` — resolve `PhotoInput[]` → URLs via `@afro90s/storage`
- [x] `lib/parse-product-body.ts` — JSON + `multipart/form-data` (`@fastify/busboy`)

### Modelos (`@afro90s/models`)

- [x] `PhotoInput` (url | base64 | stream)
- [x] `AdminCreateProductBodySchema`, `AdminUpdateProductBodySchema`, `UpdateStockSchema`

### Testes por rota

- [x] CRUD com token mock
- [x] Sem token → `401`
- [x] Produto inexistente → `404`
- [x] Validação de body → `400`
- [x] Multipart + base64 cobertos em testes de serviço/lib

## Pré-requisitos

- Tasks 10, 12 concluídas
- Infra fase 3 (rotas admin) deployada — task 16

## Critérios de conclusão

- [ ] Todas as 6 rotas admin de produtos funcionais em dev (pós-deploy infra)
- [ ] Upload de imagem retorna URL acessível via CloudFront (E2E manual)
- [x] Cobertura de testes ≥ 80%
- [x] **Status** código: concluída — aguarda revisão
