# Task 15 — IAM role admin

**Fase:** 3 — Rotas admin  
**Status:** concluída  
**Arquivos alvo:** [`resources.md`](../resources.md)

## Objetivo

Criar a role IAM da Lambda admin com permissões de CRUD em DynamoDB e escrita no S3 assets.

## O que implementar

### Role `afro90s-{env}-role-lambda-admin`

- [x] DynamoDB `products` (CRUD completo):
  - `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:Query`, `dynamodb:Scan`
  - Índices: `dynamodb:Scan` em `gsi-createdAt`
  - Resource: ARN específico + `ARN/index/*`
- [x] DynamoDB `orders`:
  - `dynamodb:GetItem`, `dynamodb:Query`, `dynamodb:Scan`, `dynamodb:UpdateItem`
  - Índice: `dynamodb:Query` em `gsi-status-createdAt`; `Scan` na tabela base quando listagem sem filtro `status`
  - Resource: ARN específico + `ARN/index/*`
- [x] S3 assets:
  - `s3:PutObject`, `s3:DeleteObject`
  - Resource: `arn:aws:s3:::afro90s-{env}-s3-assets/products/*` (prefixo restrito)
- [x] SSM: `ssm:GetParameter` em `/afro90s/{env}/*`
- [x] CloudWatch Logs: automático (CDK padrão)
- [x] **SES: nenhuma permissão** (adicionada na task 18)

### Verificações

- [x] Nenhuma action com `"Resource": "*"`
- [x] Role da Lambda admin **não** herda permissões da role pública (roles independentes)

## Pré-requisitos

- [Task 14](14-aceite-fase2.md) concluída (fase 2 entregue)

## Critérios de conclusão

- [x] Lambda admin consegue criar, editar e deletar products
- [x] Lambda admin consegue ler e atualizar orders
- [x] Lambda admin consegue fazer `PutObject` em `products/*` no bucket assets
- [x] Lambda admin **não** consegue `PutObject` fora do prefixo `products/`
- [x] `resources.md` atualizado com a role admin e suas actions
- [x] Atualizar **Status** para `concluída`
