# Task 07 — Rota `GET /products/{id}`

**Fase:** 1 — API pública  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar detalhe de um produto por ID.

## O que implementar

### `resources/products-public/src/routes/products.ts`

- [ ] Handler `GET /products/{id}`
- [ ] Validar `id` como UUID
- [ ] `productRepository.getById(id)`
- [ ] Não encontrado → `404 NOT_FOUND` com mensagem `"Product not found"`
- [ ] Resposta: `Product` completo (sem `nameLower`)

### Testes

- [ ] ID válido existente → `200` com produto
- [ ] ID inexistente → `404`
- [ ] ID malformado → `400 VALIDATION_ERROR`

## Pré-requisitos

- Task 06 concluída

## Critérios de conclusão

- [ ] `GET /products/{id}` funcional em dev
- [ ] Testes unitários passando
- [ ] Atualizar **Status** para `concluída`
