# Task 15 — Aceite Fase 3 (Rotas admin)

**Fase:** 3 — Rotas admin  
**Status:** pendente

## Objetivo

Validar CRUD de produtos, upload de imagens e gestão de pedidos com autenticação Cognito.

## Checklist de aceite

### Produtos

- [ ] `POST /admin/products` com token → `201`, produto em `GET /products`
- [ ] Imagem acessível via `AssetsCdnUrl`
- [ ] `PUT /admin/products/{id}` atualiza campos
- [ ] `PUT /admin/products/{id}/stock` atualiza quantidade
- [ ] `DELETE /admin/products/{id}` remove produto

### Pedidos

- [ ] `POST /orders` (público) cria pedido
- [ ] `GET /admin/orders` lista o pedido
- [ ] `PUT /admin/orders/{id}` atualiza status

### Auth e regressão

- [ ] Todas as rotas admin sem token → `401`
- [ ] Rotas públicas da fase 1 continuam OK
- [ ] `npm run test:coverage` ≥ 80%

## Pré-requisitos

- Tasks 13, 14 concluídas
- Infra task 17 (aceite fase 3) concluída

## Critérios de conclusão

- [ ] Checklist completo
- [ ] Atualizar **Status** para `concluída` — **fase 3 entregue**
