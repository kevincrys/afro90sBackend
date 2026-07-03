# Task 06 — Rota `GET /products`

**Fase:** 1 — API pública  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), `resources/products-public/`

## Objetivo

Implementar listagem pública de produtos com busca, filtro por categoria e paginação por cursor.

## O que implementar

### `resources/products-public/src/routes/get-products.ts`

- [x] Handler `GET /products`
- [x] Query params: `name?`, `category?`, `cursor?`, `limit?`
- [x] `ProductRepository.list(...)` + `buildPaginatedResponse`
- [x] Não expõe `nameLower` (`toPublicProduct`)

### `resources/products-public/src/handler.ts`

- [x] Roteamento para `GET /products`

### Testes

- [x] Lista vazia → `200` com `items: []`
- [x] Categoria inválida → `INVALID_QUERY`
- [x] Rota desconhecida → `404`

## Critérios de conclusão

- [x] Handler e rota implementados com testes
- [x] Atualizar **Status** para `concluída`
