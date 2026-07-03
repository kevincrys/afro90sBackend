# Task 06 — Rota `GET /products`

**Fase:** 1 — API pública  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar listagem pública de produtos com busca, filtro por categoria e paginação por cursor.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Produtos `quantity=0` | Visíveis (frontend exibe "Esgotado") |
| Busca por nome | Case-insensitive via `nameLower` |
| Filtro `category` | Query param opcional |

## O que implementar

### `resources/products-public/src/routes/products.ts`

- [ ] Handler `GET /products`
- [ ] Query params: `name?`, `category?`, `cursor?`, `limit?`
- [ ] Chamar `productRepository.list(...)`
- [ ] Resposta: `{ items: Product[], nextCursor: string | null }`
- [ ] Não expor `nameLower` na resposta

### `libs/services/product.service.ts` (`@afro90s/services`)

- [ ] `listProducts(filters)` — orquestra repositório + paginação

### Testes

- [ ] Lista vazia → `200` com `items: []`
- [ ] Com produtos → retorna array
- [ ] `name` filtra corretamente
- [ ] `category` filtra corretamente
- [ ] Cursor inválido → `400 INVALID_CURSOR`

## Pré-requisitos

- Tasks 00–05 concluídas
- Infra fase 1 deployada (API pública)

## Critérios de conclusão

- [ ] `GET /products` retorna `200` em dev
- [ ] Cobertura de testes para o handler
- [ ] `api-routes.md` seção atualizada
- [ ] Atualizar **Status** para `concluída`
