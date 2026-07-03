# Task 05 — DynamoDB

**Fase:** 1 — Site público  
**Status:** concluída  
**Arquivos alvo:** [`resources.md`](../resources.md)

## Objetivo

Implementar `DatabaseStack`: tabelas `products` e `orders` com GSIs em **on-demand**, prontas para as rotas públicas da fase 1.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Billing | **On-demand** (`PAY_PER_REQUEST`) — alinhado ao [ADR-004](../../../foundation/adr/004-serverless-architecture.md) |
| Motivo | Tráfego baixo em dev + prod na mesma conta; paga por requisição, sem capacidade reservada 24/7 |
| Free tier | 25 GB storage (conta/região); requisições cobradas por uso (centavos com volume v1) |
| PITR | Somente prod, somente tabela `orders` |
| TTL `orders` | Atributo `expiresAt`; **180 dias** após estado terminal (`CONCLUIDO` / `CANCELADO`) — backend define o valor |
| GSI products | `gsi-name` (PK: `nameLower`, SK: `id`) |
| GSI products | `gsi-createdAt` (PK: `createdAt`) para listagem pública |
| GSI orders | `gsi-status-createdAt` (PK: `status`, SK: `createdAt`) |
| `nameLower` | lowercase + remoção de acentos |
| Deletion protection | Prod apenas |

## O que implementar

### Tabela `products`

- [x] Nome: `afro90s-{env}-ddb-products`
- [x] PK: `id` (String)
- [x] `billingMode: BillingMode.PAY_PER_REQUEST`
- [x] `removalPolicy: DESTROY` dev / `RETAIN` prod
- [x] `deletionProtection: true` em prod
- [x] GSI `gsi-name`: PK `nameLower` (S), SK `id` (S)
- [x] GSI `gsi-createdAt`: PK `createdAt` (S)

### Tabela `orders`

- [x] Nome: `afro90s-{env}-ddb-orders`
- [x] PK: `id` (String)
- [x] `billingMode: BillingMode.PAY_PER_REQUEST`
- [x] `removalPolicy: DESTROY` dev / `RETAIN` prod
- [x] `deletionProtection: true` em prod
- [x] `pointInTimeRecovery: true` **somente em prod**
- [x] GSI `gsi-status-createdAt`: PK `status` (S), SK `createdAt` (S)
- [x] TTL: `timeToLiveAttribute: expiresAt` (Number, epoch segundos; preenchido pelo backend)

### TTL em `orders` (infra + contrato backend)

- [x] CDK habilita TTL no atributo `expiresAt`
- [ ] Backend define `expiresAt` ao entrar em `CONCLUIDO` ou `CANCELADO`: `now + 180 dias` (ver [data-models.md](../../backend/data-models.md))
- [ ] Pedidos ativos **sem** `expiresAt` não expiram

### Exports via SSM

- [x] `/afro90s/{env}/products-table-name`
- [x] `/afro90s/{env}/orders-table-name`

### Outputs CloudFormation

- [x] `CfnOutput` `ProductsTableName`
- [x] `CfnOutput` `OrdersTableName`

## Pré-requisitos

- [Task 04](04-cicd.md) concluída (CI/CD pronto para deploy)

## Critérios de conclusão

- [ ] Tabelas visíveis no console DynamoDB
- [x] Billing on-demand em ambas as tabelas (sem WCU/RCU provisionados)
- [x] PITR ativo em prod somente para `orders`
- [x] TTL habilitado em `orders` (`expiresAt`)
- [x] Outputs `ProductsTableName` e `OrdersTableName` no CloudFormation
- [x] `resources.md` atualizado
- [x] Atualizar **Status** para `concluída`
