# Task 03 — Cliente API e React Query

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md)

## Objetivo

Implementar camada HTTP tipada com Axios, React Query e tratamento de erros da API.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Cliente | Axios com wrapper `apiClient` |
| Erros | Classe `ApiError` com `code` e `message` |
| Tipos | Importados/espelhados de `data-models` do backend |
| Auth admin | Interceptor `Authorization: Bearer` (fase 2) |
| Cursor | `encodeURIComponent` nas query strings |

## O que implementar

### `src/api/client.ts`

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor: ApiError em erros 4xx/5xx
// Request interceptor (fase 2): adicionar Bearer token para /admin/*
```

### Módulos por domínio

- [ ] `src/api/products.ts` — `getProducts`, `getProductById`
- [ ] `src/api/orders.ts` — `createOrder`
- [ ] `src/api/admin/products.ts` — CRUD (fase 3, criar stubs)
- [ ] `src/api/admin/orders.ts` — list, get, updateStatus (fase 3, stubs)

### `src/types/` — espelhar backend

- [ ] `product.ts`, `order.ts`, `errors.ts` — mesmos tipos do `afro90s-api`

### React Query

- [ ] `QueryClientProvider` em `main.tsx`
- [ ] Defaults: `staleTime: 30_000`, `retry: 1`
- [ ] Query keys documentadas:

| Key | Uso |
|-----|-----|
| `['products', filters]` | Listagem catálogo |
| `['product', id]` | Detalhe |
| `['admin', 'products', filters]` | Admin listagem |
| `['admin', 'orders', filters]` | Admin pedidos |

### Hooks

- [ ] `useProducts({ name, category, cursor })`
- [ ] `useProduct(id)`
- [ ] `useCreateOrder()` — mutation

## Pré-requisitos

- Task 00 concluída
- Backend fase 1 deployada (ou mock local) para testar integração

## Critérios de conclusão

- [ ] `useProducts()` retorna dados da API dev
- [ ] Erro 404 mapeado para `ApiError`
- [ ] `integration.md` atualizado
- [ ] Atualizar **Status** para `concluída`
