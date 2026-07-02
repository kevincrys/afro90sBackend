# Task 02 — Roteamento e layout

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Configurar React Router com rotas públicas e admin, layout compartilhado e página 404.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Layout | Único (`PublicLayout`) — admin usa mesmo header simplificado |
| Header público | Logo, carrinho, busca, categorias |
| Header admin | Logo + logout |
| Admin redirect pós-login | `/admin/pedidos` |
| 404 | Página customizada com tema anos 90 |
| Scroll to top | Sim, em mudança de rota |

## O que implementar

### Rotas

| Rota | Componente | Auth | Fase |
|------|------------|------|------|
| `/` | `CatalogPage` | Não | 1 |
| `/produto/:id` | `ProductDetailPage` | Não | 1 |
| `/admin/login` | `AdminLoginPage` | Não | 2 |
| `/admin/pedidos` | `AdminOrdersPage` | Sim | 3 |
| `/admin/produtos` | `AdminProductsPage` | Não | 3 |
| `*` | `NotFoundPage` | Não | 0 |

### `src/routes/index.tsx`

- [ ] `BrowserRouter` com `Routes` e `Route`
- [ ] `PublicLayout` wrapping rotas públicas (Header + Footer + `<Outlet>`)
- [ ] `AdminLayout` para `/admin/*` (header simplificado)
- [ ] `ProtectedRoute` component (implementado na task 11 — fase 2; placeholder que redireciona para `/admin/login`)
- [ ] `ScrollToTop` component

### `NotFoundPage`

- [ ] Mensagem temática anos 90
- [ ] Link "Voltar ao catálogo"

## Pré-requisitos

- Tasks 00, 01 concluídas

## Critérios de conclusão

- [ ] Navegação entre rotas sem reload
- [ ] `/rota-inexistente` → página 404
- [ ] Scroll to top funciona
- [ ] `overview.md` tabela de rotas atualizada
- [ ] Atualizar **Status** para `concluída`
