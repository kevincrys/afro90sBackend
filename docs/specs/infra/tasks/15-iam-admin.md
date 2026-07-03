# Task 15 — IAM role admin

**Fase:** 3 — Rotas admin  
**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md)

## Objetivo

Criar a role IAM da Lambda admin com permissões de CRUD em DynamoDB e escrita no S3 assets.

## O que implementar

### Role `afro90s-{env}-role-lambda-admin`

- [ ] DynamoDB `products` (CRUD completo):
  - `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:Query`, `dynamodb:Scan`
  - Índices: `dynamodb:Scan` em `gsi-createdAt`
  - Resource: ARN específico + `ARN/index/*`
- [ ] DynamoDB `orders`:
  - `dynamodb:GetItem`, `dynamodb:Query`, `dynamodb:UpdateItem`
  - Índice: `dynamodb:Query` em `gsi-status-createdAt`
  - Resource: ARN específico + `ARN/index/*`
- [ ] S3 assets:
  - `s3:PutObject`, `s3:DeleteObject`
  - Resource: `arn:aws:s3:::afro90s-{env}-s3-assets/products/*` (prefixo restrito)
- [ ] SSM: `ssm:GetParameter` em `/afro90s/{env}/*`
- [ ] CloudWatch Logs: automático (CDK padrão)
- [ ] **SES: nenhuma permissão** (adicionada na task 18)

### Verificações

- [ ] Nenhuma action com `"Resource": "*"`
- [ ] Role da Lambda admin **não** herda permissões da role pública (roles independentes)

## Pré-requisitos

- [Task 14](14-aceite-fase2.md) concluída (fase 2 entregue)

## Critérios de conclusão

- [ ] Lambda admin consegue criar, editar e deletar products
- [ ] Lambda admin consegue ler e atualizar orders
- [ ] Lambda admin consegue fazer `PutObject` em `products/*` no bucket assets
- [ ] Lambda admin **não** consegue `PutObject` fora do prefixo `products/`
- [ ] `resources.md` atualizado com a role admin e suas actions
- [ ] Atualizar **Status** para `concluída`
