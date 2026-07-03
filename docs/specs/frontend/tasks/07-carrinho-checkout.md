# Task 07 — Carrinho e checkout (drawer)

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md), [`integration.md`](../integration.md)

## Objetivo

Implementar carrinho Zustand com drawer lateral e formulário de checkout integrado ao `POST /orders`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Estado | Zustand (não Context) |
| Persistência | `localStorage` |
| UI checkout | Drawer lateral (não página `/checkout`) |
| Validação | Zod + react-hook-form |
| Máscaras | CEP e telefone |
| Total | Somente leitura — vem da resposta API |
| Limpar carrinho | Apenas após `201` |

## O que implementar

### `src/stores/cart.store.ts`

```typescript
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  photo: string;
  maxQuantity: number;
  selectedOption?: string;  // obrigatório no item se produto tinha options
}
// addItem, removeItem, updateQuantity, clear, totalItems, items
// persist middleware com localStorage
```

### `src/components/CartDrawer.tsx`

- [ ] Drawer lateral aberto pelo ícone carrinho no Header
- [ ] Lista de itens com imagem, nome, quantidade, opção (se houver), subtotal
- [ ] Botão remover item
- [ ] Seção checkout (formulário) no mesmo drawer:
  - Campos: `name`, `address`, `postalCode`, `tel`
  - Máscaras CEP (`00000-000`) e tel (`(00) 00000-0000`)
  - Validação Zod antes de submit
- [ ] Botão "Finalizar pedido" com loading state
- [ ] `useCreateOrder()` mutation
- [ ] `POST /orders` envia `selectedOption` por item quando aplicável
- [ ] Tratamento de erros: `INSUFFICIENT_STOCK`, `VALIDATION_ERROR`, `INVALID_OPTION` (mapear para pt-BR)
- [ ] Após `201`: limpar carrinho → chamar fluxo WhatsApp (task 08)

### Drawer vazio

- [ ] Mensagem "Seu carrinho está vazio" + link ao catálogo

## Pré-requisitos

- Tasks 03, 06 concluídas

## Critérios de conclusão

- [ ] Adicionar/remover itens funciona
- [ ] Carrinho persiste após reload
- [ ] Checkout cria pedido (`201`)
- [ ] Erros exibidos em português
- [ ] Atualizar **Status** para `concluída`
