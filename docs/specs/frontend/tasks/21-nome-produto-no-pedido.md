# Task 21 — Nome do produto no pedido (admin + WhatsApp)

**Fase:** 3 — Painel admin (extensão)  
**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md), [`ui-ux.md`](../ui-ux.md), [`data-models.md`](../../backend/data-models.md)

## Objetivo

Exibir nome do produto (`OrderItem.productName`) na admin de pedidos. Opcionalmente incluir nomes na mensagem WhatsApp pós-checkout.

**Prioridade:** admin (obrigatório) > WhatsApp (secundário).

## O que implementar

### Prioridade 1 — Admin (obrigatório)

- [ ] `OrderItem` em `src/types/order.ts`: `productName?: string`
- [ ] Helper `getOrderItemLabel(item)` com fallback `productName ?? productId`
- [ ] `OrderDetailDrawer`: exibir nome do produto em destaque; `productId` opcional em texto secundário mono
- [ ] `AdminOrdersTab`: coluna ITENS / preview usa nomes (`formatItemsPreview`)

### Prioridade 2 — WhatsApp (secundário)

- [ ] `buildOrderSnapshot` em `CartDrawer`: mapear `productName: item.name` do carrinho
- [ ] `buildWhatsAppOrderMessage`: listar itens com nome, qty e opção (substituir linha `Itens: N`)
- [ ] Testes em `whatsapp.test.ts`

## Comportamento UX

- Pedidos novos: nome legível na listagem e no drawer
- Pedidos legados sem `productName`: fallback para `productId` truncado
- WhatsApp: lista de itens quando `productName` disponível no snapshot local

## Pré-requisitos

- Backend task 21 deployada (ou tipos toleram campo ausente com fallback)
- Task 14 (admin pedidos) funcional

## Critérios de conclusão

- [ ] Listagem admin mostra nomes dos produtos
- [ ] Drawer mostra nome em destaque por item
- [ ] Pedidos antigos sem `productName` exibem fallback legível
- [ ] (Opcional) WhatsApp lista nomes dos itens
- [ ] Atualizar **Status** para `concluída`
