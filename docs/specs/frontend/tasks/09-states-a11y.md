# Task 09 — Estados de UI e acessibilidade

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md)

## Objetivo

Padronizar loading, empty, error e requisitos de acessibilidade nas páginas da fase 1.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Toasts | Sonner |
| Skeletons | Por página (não global) |
| Erros API | Mapear `ApiError.message` para pt-BR |
| Foco em modais | Sim |
| `aria-live` | Sim, para feedback de pedido |
| Skip link | Sim |

## O que implementar

### Toasts (Sonner)

- [ ] `<Toaster />` em `App.tsx`
- [ ] Sucesso: "Pedido realizado com sucesso!"
- [ ] Erro: mensagem mapeada em português

### Mapeamento de erros `src/lib/errorMessages.ts`

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_STOCK: 'Produto fora de estoque.',
  VALIDATION_ERROR: 'Verifique os dados informados.',
  NOT_FOUND: 'Produto não encontrado.',
  INTERNAL_ERROR: 'Erro interno. Tente novamente.',
};
```

### Skeletons por página

- [ ] `CatalogSkeleton` — grid de cards placeholder
- [ ] `ProductDetailSkeleton` — imagem + texto placeholder

### Acessibilidade

- [ ] Skip link "Ir para o conteúdo" no topo
- [ ] `aria-live="polite"` na confirmação de pedido
- [ ] Foco trap no modal de galeria e no CartDrawer
- [ ] Labels em todos os inputs do checkout
- [ ] Contraste mínimo WCAG AA nas cores primárias

## Pré-requisitos

- Tasks 05–08 concluídas

## Critérios de conclusão

- [ ] Loading/empty/error visíveis em catálogo e detalhe
- [ ] Toasts funcionam para sucesso e erro
- [ ] Skip link presente
- [ ] `ui-ux.md` tabela de estados atualizada
- [ ] Atualizar **Status** para `concluída`
