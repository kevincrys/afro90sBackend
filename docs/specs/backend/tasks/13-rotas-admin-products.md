# Task 13 — Rotas admin de produtos

**Fase:** 3 — Rotas admin  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar CRUD completo de produtos nas rotas `/admin/products*`.

## O que implementar

### `resources/products-admin/src/routes/products.ts`

- [ ] `GET /admin/products` — listagem com `name?`, `category?`, `cursor`, `limit`
- [ ] `POST /admin/products` — criar produto + upload de imagens multipart
- [ ] `GET /admin/products/{id}` — detalhe
- [ ] `PUT /admin/products/{id}` — atualizar campos
- [ ] `DELETE /admin/products/{id}` — remover produto e imagens do S3
- [ ] `PUT /admin/products/{id}/stock` — atualizar apenas `quantity`

Todas com middleware auth (task 10).

### `libs/services/product.service.ts` (expandir)

- [ ] `createProduct(input, images?)` — gera `id`, `nameLower`, timestamps, upload S3
- [ ] `updateProduct(id, fields)`
- [ ] `deleteProduct(id)` — remove do DynamoDB + imagens S3
- [ ] `updateStock(id, quantity)`

### Testes por rota

- [ ] CRUD completo com token mock
- [ ] Sem token → `401`
- [ ] Produto inexistente → `404`
- [ ] Validação de body → `400`

## Pré-requisitos

- Tasks 10, 12 concluídas
- Infra fase 3 (rotas admin) deployada

## Critérios de conclusão

- [ ] Todas as 6 rotas admin de produtos funcionais em dev
- [ ] Upload de imagem retorna URL acessível via CloudFront
- [ ] Cobertura de testes ≥ 80% nas rotas admin
- [ ] Atualizar **Status** para `concluída`
