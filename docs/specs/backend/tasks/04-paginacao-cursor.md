# Task 04 — Paginação por cursor

**Fase:** 0 — Fundação  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), `libs/pagination/`

## Objetivo

Implementar utilitário de cursor opaco Base64URL para listagens paginadas.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Formato cursor | Base64URL de JSON interno (`v`, `index`, `key`, `filters`) |
| `limit` default | 20 |
| `limit` máximo | 100 (`api-routes.md`) |
| Cursor inválido | `400 INVALID_CURSOR` |
| `limit` inválido | `400 INVALID_QUERY` |

## O que implementar

### `libs/pagination/`

- [x] `encodeCursor` / `decodeCursor` com Base64URL
- [x] Validar estrutura e compatibilidade de `filters`
- [x] `parseLimit` — default 20, rejeita fora de 1–100
- [x] `buildPaginatedResponse` com `hasMore` e `nextCursor`

Filtros em `filters` do cursor incluem, conforme a rota: `name`, `category`, `status`, **`q`** (busca admin de pedidos). Exemplo:

```json
{ "v": 1, "index": "primary", "key": { "id": "..." }, "filters": { "q": "maria" } }
```

## Critérios de conclusão

- [x] Utilitário coberto por testes unitários
- [x] `api-routes.md` documenta formato de `cursor` e `limit`
- [x] Atualizar **Status** para `concluída`
