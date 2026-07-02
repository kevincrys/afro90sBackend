# Task 05 — DynamoDB

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md)

## Objetivo

Implementar `DatabaseStack`: tabelas `products` e `orders` com GSIs dentro do free tier, prontas para as rotas públicas da fase 1.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Billing | PROVISIONED (free tier: 25 WCU + 25 RCU total entre tabelas e GSIs) |
| Auto-scaling | Desativado (para não ultrapassar free tier) |
| PITR | Somente prod, somente tabela `orders` |
| GSI products | `gsi-name` (PK: `nameLower`, SK: `id`) |
| GSI products | `gsi-createdAt` (PK: `createdAt`) para listagem pública |
| GSI orders | `gsi-status-createdAt` (PK: `status`, SK: `createdAt`) |
| `nameLower` | lowercase + remoção de acentos |
| Deletion protection | Prod apenas |

## O que implementar

### Distribuição de capacidade (free tier)

| Recurso | WCU | RCU |
|---------|-----|-----|
| `products` table | 3 | 5 |
| `gsi-name` | 1 | 2 |
| `gsi-createdAt` | 1 | 2 |
| `orders` table | 3 | 5 |
| `gsi-status-createdAt` | 1 | 2 |
| **Total** | **9** | **16** |

### Tabela `products`

- [ ] Nome: `afro90s-{env}-ddb-products`
- [ ] PK: `id` (String)
- [ ] `billingMode: BillingMode.PROVISIONED`, WCU 3, RCU 5
- [ ] `removalPolicy: DESTROY` dev / `RETAIN` prod
- [ ] `deletionProtection: true` em prod
- [ ] GSI `gsi-name`: PK `nameLower` (S), SK `id` (S) — WCU 1, RCU 2
- [ ] GSI `gsi-createdAt`: PK `createdAt` (S) — WCU 1, RCU 2

### Tabela `orders`

- [ ] Nome: `afro90s-{env}-ddb-orders`
- [ ] PK: `id` (String)
- [ ] `billingMode: BillingMode.PROVISIONED`, WCU 3, RCU 5
- [ ] `removalPolicy: DESTROY` dev / `RETAIN` prod
- [ ] `deletionProtection: true` em prod
- [ ] `pointInTimeRecovery: true` **somente em prod**
- [ ] GSI `gsi-status-createdAt`: PK `status` (S), SK `createdAt` (S) — WCU 1, RCU 2

### Exports via SSM

- [ ] `/afro90s/{env}/products-table-name`
- [ ] `/afro90s/{env}/orders-table-name`

### Outputs CloudFormation

- [ ] `CfnOutput` `ProductsTableName`
- [ ] `CfnOutput` `OrdersTableName`

## Pré-requisitos

- Tasks 01, 02, 03 concluídas

## Critérios de conclusão

- [ ] Tabelas visíveis no console DynamoDB
- [ ] Total WCU + RCU (tabelas + GSIs) ≤ 25 (free tier confirmado)
- [ ] PITR ativo em prod somente para `orders`
- [ ] Outputs `ProductsTableName` e `OrdersTableName` no CloudFormation
- [ ] `resources.md` atualizado
- [ ] Atualizar **Status** para `concluída`
