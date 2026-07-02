# Task 08 — Fluxo WhatsApp pós-pedido

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md), [ADR-006](../../../foundation/adr/006-whatsapp-integration.md)

## Objetivo

Após pedido criado com sucesso, abrir WhatsApp automaticamente com mensagem de resumo.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Abertura | Automática em nova aba ao finalizar |
| Mensagem | Só resumo (não lista de itens) |
| `VITE_WHATSAPP_NUMBER` | Validar formato DDI+DDD+número |
| `orderId` | Incluído na mensagem |
| Mobile | Deep link `whatsapp://` |
| Fallback | Link clicável se popup bloqueado |

## O que implementar

### `src/lib/whatsapp.ts`

```typescript
export function openWhatsAppOrder(order: { id: string; customerName: string; fullPrice: number }): void {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER;
  const text = encodeURIComponent(
    `Olá! Fiz um pedido no Afro90s.\nID: ${order.id}\nTotal: R$ ${order.fullPrice.toFixed(2).replace('.', ',')}`
  );
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const url = isMobile
    ? `whatsapp://send?phone=${number}&text=${text}`
    : `https://wa.me/${number}?text=${text}`;
  window.open(url, '_blank');
}
```

- [ ] Validar `VITE_WHATSAPP_NUMBER` no boot (warn se ausente)
- [ ] Integrar em `CartDrawer` após `201` do `POST /orders`
- [ ] Tela de confirmação breve no drawer antes de abrir WhatsApp
- [ ] Fallback: se `window.open` bloqueado, exibir botão "Continuar no WhatsApp"

## Pré-requisitos

- Task 07 concluída

## Critérios de conclusão

- [ ] Finalizar pedido abre WhatsApp com mensagem correta
- [ ] `orderId` presente na mensagem
- [ ] Fallback funciona com popup bloqueado
- [ ] `integration.md` fluxo documentado
- [ ] Atualizar **Status** para `concluída`
