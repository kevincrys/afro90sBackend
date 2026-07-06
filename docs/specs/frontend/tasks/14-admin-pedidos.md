# Task 14 — Admin — Gestão de pedidos

**Fase:** 3 — Rotas admin  
**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md), [`ui-ux.md`](../ui-ux.md)

## Objetivo

Implementar listagem de pedidos e atualização de status no painel admin.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Filtro status | Tabs |
| Ordenação | Mais recentes primeiro |
| Detalhe | Drawer lateral |
| Transições status | Apenas válidas (dropdown filtrado) |
| Dados customer | Exibir no drawer |
| Paginação | Cursor |

## O que implementar

### `src/pages/admin/AdminOrdersPage.tsx`

- [ ] Tabs de status: Todos, Solicitado, Confirmado, Enviado, Entregue, Cancelado
- [ ] `useAdminOrders({ status, cursor })` com paginação
- [ ] Lista de cards: `orderId`, `customerName`, `fullPrice`, `status`, `createdAt`
- [ ] Clique no card → abre drawer de detalhe

### `src/components/admin/OrderDetailDrawer.tsx`

- [ ] Dados do `customer` (nome, endereço, CEP, tel)
- [ ] Lista de itens com `productId`, quantidade, `unitPrice`
- [ ] Dropdown de status com apenas transições válidas
- [x] `PUT /admin/orders/{id}` ao mudar status
- [ ] Toast de sucesso/erro

### Labels pt-BR

```typescript
const STATUS_LABELS = {
  SOLICITADO: 'Solicitado',
  CONFIRMADO: 'Confirmado',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};
```

## Pré-requisitos

- Task 13 concluída

## Critérios de conclusão

- [ ] Pedido criado no checkout aparece na listagem admin
- [ ] Mudança de status funciona com transições válidas
- [ ] Drawer exibe dados completos do pedido
- [ ] Atualizar **Status** para `concluída`

> **Extensão (task 21):** exibir nome do produto nos itens do pedido — ver [21-nome-produto-no-pedido.md](21-nome-produto-no-pedido.md).
