# Task 05 — Acesso DynamoDB

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`data-models.md`](../data-models.md)

## Objetivo

Implementar repositórios DynamoDB para `products` e `orders` com queries nos GSIs definidos na infra.

## Configurações já definidas

| GSI | Tabela | Uso |
|-----|--------|-----|
| `gsi-name` | products | Busca por prefixo de `nameLower` |
| `gsi-createdAt` | products | Listagem pública sem filtro de nome |
| `gsi-status-createdAt` | orders | Listagem admin filtrada por status |

## O que implementar

### `libs/dynamodb/` (`@afro90s/dynamodb`)

- [ ] Singleton `DynamoDBDocumentClient` com `marshallOptions: { removeUndefinedValues: true }`
- [ ] Nomes de tabela via env: `PRODUCTS_TABLE`, `ORDERS_TABLE`

### `libs/repositories/product.repository.ts` (`@afro90s/repositories`)

- [ ] `getById(id)` → `GetItem`
- [ ] `list({ name?, category?, cursor, limit })`:
  - Com `name`: Query em `gsi-name` com `begins_with(nameLower, ...)`
  - Sem `name`: Query em `gsi-createdAt`
  - Com `category`: FilterExpression em `category`
- [ ] `create(product)`, `update(id, fields)`, `delete(id)`
- [ ] `updateStock(id, quantity)` → `UpdateItem` em `quantity`

### `libs/repositories/order.repository.ts`

- [ ] `create(order)` → `PutItem`
- [ ] `getById(id)` → `GetItem`
- [ ] `list({ status?, cursor, limit })` → Query em `gsi-status-createdAt`
- [ ] `updateStatus(id, status)` → `UpdateItem` com validação de transição

### Testes de integração (DynamoDB Local opcional)

- [ ] Mock do client com `@aws-sdk/client-dynamodb` mock ou DynamoDB Local
- [ ] Testar query com cursor round-trip

## Pré-requisitos

- Tasks 02, 04 concluídas
- Infra task 05 (DynamoDB) deployada ou DynamoDB Local para testes

## Critérios de conclusão

- [ ] Repositórios compilam e têm testes unitários com mock
- [ ] Queries usam GSIs corretos (não Scan desnecessário)
- [ ] Atualizar **Status** para `concluída`
