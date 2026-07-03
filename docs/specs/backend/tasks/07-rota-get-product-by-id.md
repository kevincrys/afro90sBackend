# Task 07 — Rota `GET /products/{id}`

**Fase:** 1 — API pública  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), `resources/products-public/`

## Objetivo

Implementar detalhe de um produto por ID.

## O que implementar

### `resources/products-public/src/routes/get-product-by-id.ts`

- [x] Handler `GET /products/{id}`
- [x] Validar `id` como UUID
- [x] `productRepository.getById(id)`
- [x] Não encontrado → `404 NOT_FOUND` (`Produto não encontrado.`)
- [x] Resposta: `Product` completo (sem `nameLower`)

### `resources/products-public/src/handler.ts`

- [x] Roteamento para `GET /products/{id}`

### Testes

- [x] ID válido existente → `200` com produto
- [x] ID inexistente → `404`
- [x] ID malformado → `400 VALIDATION_ERROR`

## Pré-requisitos

- Task 06 concluída

## Critérios de conclusão

- [x] Handler e rota implementados com testes
- [x] Atualizar **Status** para `concluída`
