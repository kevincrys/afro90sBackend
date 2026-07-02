# Task 09 — Aceite Fase 1 (API pública)

**Fase:** 1 — API pública  
**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar que as 3 rotas públicas funcionam end-to-end em `dev`, alinhadas com a infra fase 1.

## Checklist de aceite

- [ ] `GET /products` → `200` com `{ items: [], nextCursor: null }`
- [ ] `GET /products/{id}` inexistente → `404`
- [ ] `POST /orders` body inválido → `400`
- [ ] `POST /orders` válido → `201` (sem e-mail)
- [ ] `GET /admin/products` → `404` ou `401` (rota ainda não existe — OK)
- [ ] Headers `Content-Type` e `X-Request-Id` em todas as respostas
- [ ] CORS headers para origem CloudFront
- [ ] `npm run test:coverage` ≥ 80% nas rotas da fase 1
- [ ] Deploy via CI do repo `afro90s-api` (bundle no CDK infra)

## Pré-requisitos

- Tasks 00–08 concluídas
- Infra task 12 (aceite fase 1) concluída

## Critérios de conclusão

- [ ] Todos os itens do checklist marcados
- [ ] Atualizar **Status** para `concluída` — **fase 1 entregue**
