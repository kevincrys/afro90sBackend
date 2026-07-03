# Handoff — Remover GSI `gsi-name` da tabela `products`

**Para:** repo `afro90sInfra`  
**Backend:** alinhado neste repositório (Scan na tabela base)  
**Data:** 2026-07-03

## Contexto

O GSI `gsi-name` (PK `nameLower`, SK `id`) foi planejado para busca por prefixo via `Query`, mas o DynamoDB **não permite** `BETWEEN`/`begins_with` na partition key — só igualdade. Isso causava `ValidationException` → `500` em `GET /products?name=…`.

## Decisão v1

| Item | Valor |
|------|-------|
| Busca por `name` | `Scan` na tabela `products` + `begins_with(nameLower, :prefix)` |
| Atributo `nameLower` | Mantido no item (gerado pelo backend); **não** precisa de GSI |
| Cursor com `name` | `index: "primary"`, `key: { "id": "…" }` |
| GSI `gsi-name` | **Remover** |

## O que alterar no CDK (`afro90sInfra`)

### `DatabaseStack` — tabela `products`

- [ ] Remover GSI `gsi-name` (PK `nameLower`, SK `id`)
- [ ] Manter GSI `gsi-createdAt` (PK `createdAt`)

### IAM — `role-lambda-products-public` e leitura em `orders-public`

- [ ] Remover permissões específicas a `index/gsi-name` (se existirem)
- [ ] Manter `dynamodb:Scan` na tabela base (obrigatório para busca por nome)
- [ ] Manter `dynamodb:Scan` em `index/gsi-createdAt`

### Docs infra

- [ ] `resources.md`, task 05, task 08, task 15 — já refletem remoção neste repo backend; replicar no infra

## Ordem de deploy

1. **Deploy backend** (`products-public`) com Scan na tabela base — **antes** ou **junto** com remoção do GSI
2. **Deploy infra** removendo `gsi-name`
3. Validar: `GET /products?name=cat&category=oculos` → `200`

> Cursors antigos com `index: "gsi-name"` passam a retornar `400 INVALID_CURSOR` (aceitável na v1).

## Critérios de aceite

- [ ] Console DynamoDB: tabela `afro90s-{env}-ddb-products` sem índice `gsi-name`
- [ ] `GET /products?name=…` → `200`
- [ ] `GET /products?category=oculos` → `200` (regressão)
- [ ] CloudWatch sem `ValidationException` em buscas por nome
