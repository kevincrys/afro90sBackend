# Task 17 — Aceite Fase 3 (Rotas admin)

**Fase:** 3 — Rotas admin  
**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar que o painel admin está funcional: CRUD de produtos, gestão de pedidos, upload de imagens — tudo protegido por Cognito.

## Checklist de aceite

### Autenticação e autorização

- [ ] `GET /admin/products` sem token → `401`
- [ ] `GET /admin/products` com token expirado → `401`
- [ ] `GET /admin/products` com token válido (grupo `admins`) → `200`

### Produtos

- [ ] `POST /admin/products` cria produto → `201`, produto aparece em `GET /products`
- [ ] Imagem do produto acessível via `{AssetsCdnUrl}/products/{id}/{uuid}.jpg`
- [ ] `PUT /admin/products/{id}` atualiza nome/preço
- [ ] `PUT /admin/products/{id}/stock` atualiza quantidade
- [ ] `DELETE /admin/products/{id}` remove produto; `GET /products/{id}` retorna `404`

### Pedidos

- [ ] `GET /admin/orders` lista pedidos (pode estar vazio)
- [ ] `POST /orders` cria pedido (rota pública); `GET /admin/orders` mostra o pedido
- [ ] `PUT /admin/orders/{id}` atualiza status

### Regressão

- [ ] `GET /products` continua retornando `200`
- [ ] `POST /orders` continua retornando `201`
- [ ] CloudFront frontend ainda acessível

## Pré-requisitos

- [Task 16](16-api-admin.md) concluída

## Critérios de conclusão

- [ ] Todos os itens do checklist marcados
- [ ] `overview.md` atualizado com status da fase 3
- [ ] Atualizar **Status** para `concluída` — **fase 3 entregue**
