# Task 13 — Admin — CRUD de produtos

**Fase:** 3 — Rotas admin  
**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md), [`integration.md`](../integration.md)

## Objetivo

Implementar painel de gestão de produtos: listagem, criar, editar, excluir e upload de imagens.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| UI listagem | Cards (não tabela) |
| Formulário | Modal |
| Upload | Multipart |
| Preview imagens | Sim, antes de salvar |
| Reordenar fotos | Sim, na v1 |
| Confirmação delete | Sim |
| Estoque | Na mesma tela do formulário |
| Descrição | Textarea; max 2000 caracteres |
| Opções | Lista editável; max 5 variações (ex.: cores); cada 1–40 chars |

## O que implementar

### `src/pages/admin/AdminProductsPage.tsx`

- [ ] Grid de cards com imagem, nome, preço, estoque
- [ ] `useAdminProducts()` com paginação
- [ ] Botão "Novo produto" → abre modal
- [ ] Ações por card: editar, excluir

### `src/components/admin/ProductFormModal.tsx`

- [ ] Campos: `name`, `description`, `price`, `quantity`, `category`, `options` (0–5)
- [ ] Upload de imagens (input file, multipart)
- [ ] Preview das imagens selecionadas com reordenação (drag ou botões ↑↓)
- [ ] Validação Zod
- [ ] Modo create: `POST /admin/products`
- [ ] Modo edit: `PUT /admin/products/{id}`
- [ ] Campo estoque atualiza via `PUT /admin/products/{id}/stock` ou junto no PUT

### Delete

- [ ] Dialog de confirmação "Tem certeza?"
- [ ] `DELETE /admin/products/{id}`
- [ ] Invalidar cache `['admin', 'products']`

### Skeleton e estados

- [ ] Skeleton de cards admin
- [ ] Empty: "Nenhum produto cadastrado"

## Pré-requisitos

- Fase 2 entregue (task 12)
- Backend fase 3 + infra fase 3 deployados

## Critérios de conclusão

- [ ] CRUD completo funcional com token admin
- [ ] Upload de imagem → produto aparece no catálogo público
- [ ] Delete remove produto do catálogo
- [ ] Atualizar **Status** para `concluída`
