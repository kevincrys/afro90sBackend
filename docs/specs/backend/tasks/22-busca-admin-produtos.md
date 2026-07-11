# Task 22 — Busca admin de produtos (`q`)

**Fase:** 3 — Rotas admin (extensão)  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## História de usuário

**Como** administrador autenticado  
**Quero** filtrar produtos por ID ou prefixo do nome em `GET /admin/products?q=`  
**Para** localizar itens no painel como na busca de pedidos

## Critérios de aceite (API)

| # | Requisição | Resultado esperado |
|---|------------|-------------------|
| 1 | `GET /admin/products?q=oculos` | Produtos cujo `nameLower` começa com o prefixo |
| 2 | `GET /admin/products?q={uuid}` | `GetItem` — 0 ou 1 produto |
| 3 | `GET /admin/products?q=550e8400` | Prefixo de ID |
| 4 | `GET /admin/products?q=Óculos 90` | Modo nome (dígitos no nome OK) |
| 5 | `GET /admin/products?q=dead` | OR id **ou** nome |
| 6 | `GET /admin/products?category=X&q=Y` | Combina filtros |
| 7 | `GET /admin/products?q=a` | `400 INVALID_QUERY` |
| 8 | `GET /admin/products?q=` (121+ chars) | `400 INVALID_QUERY` |
| 9 | Cursor de `q=maria` com `q=joao` | `400 INVALID_CURSOR` |

## Implementação

- [x] `libs/repositories/src/product-search.ts` — heurística (hex+dígito → ID; nome com dígito → nome)
- [x] `ProductRepository.list({ q?, … })`
- [x] `normalizeCursorFilters` inclui `q`
- [x] `get-admin-products.ts` — parse `q` (2–120); `name` legado se sem `q`
- [x] Frontend: barra em `AdminProductsTab` (espelho Pedidos)

## Critérios de conclusão

- [x] Testes unitários classifier / repository / handler
- [x] Spec `api-routes.md` atualizada
