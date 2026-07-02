# Task 06 — Detalhe do produto (`/produto/:id`)

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md)

## Objetivo

Implementar página de detalhe com galeria, informações e botão adicionar ao carrinho.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Galeria | Imagem única; clique abre modal com carrossel |
| URLs `photos[]` | Sempre absolutas (não relativas) |
| Quantidade | Seletor 1..N limitado a `product.quantity` |
| Esgotado | Botão desabilitado |
| SEO | `document.title` = nome do produto |

## O que implementar

### `src/pages/product/ProductDetailPage.tsx`

- [ ] `useProduct(id)` com React Query
- [ ] Imagem principal clicável → modal com carrossel de `photos[]`
- [ ] Nome, preço, categoria, descrição (se houver)
- [ ] Seletor de quantidade (1 até `product.quantity`)
- [ ] Botão "Adicionar ao carrinho" → Zustand store (task 07)
- [ ] Botão desabilitado se `quantity === 0`
- [ ] Link "Voltar ao catálogo"
- [ ] Skeleton durante loading
- [ ] `document.title = product.name`
- [ ] `alt` em imagens = `product.name`

## Pré-requisitos

- Task 05 concluída

## Critérios de conclusão

- [ ] Detalhe carrega produto por ID
- [ ] Modal de galeria funciona
- [ ] Adicionar ao carrinho atualiza badge no header
- [ ] Atualizar **Status** para `concluída`
