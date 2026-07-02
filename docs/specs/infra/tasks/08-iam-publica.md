# Task 08 — IAM role pública

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md)

## Objetivo

Criar a role IAM da Lambda pública (`GET /products`, `GET /products/{id}`, `POST /orders`) com least privilege. A role admin fica para a fase 3.

> **Nota:** `POST /orders` na fase 1 cria o pedido no DynamoDB mas **não envia e-mail** (SES é fase 4). A permissão SES é adicionada na task 18.

## O que implementar

### Role `afro90s-{env}-role-lambda-public`

- [ ] DynamoDB `products`:
  - `dynamodb:GetItem`, `dynamodb:Query`, `dynamodb:Scan`
  - Em índices: `dynamodb:Query` no `gsi-name` e `gsi-createdAt`
  - Resource: ARN específico da tabela + `ARN/index/*`
- [ ] DynamoDB `orders`:
  - `dynamodb:PutItem`
  - Resource: ARN específico da tabela
- [ ] SSM:
  - `ssm:GetParameter` restrito a `/afro90s/{env}/*`
- [ ] CloudWatch Logs: gerenciado automaticamente pelo CDK (não adicionar manualmente)
- [ ] **SES: nenhuma permissão nesta fase** (adicionada na task 18)

### Boas práticas

- [ ] Nenhuma action com `"Resource": "*"`
- [ ] Verificar no `cdk synth` que a role **não** tem `AdministratorAccess`
- [ ] API Gateway → Lambda: permission criada automaticamente pelo CDK

## Pré-requisitos

- [Task 07](07-assets-storage.md) concluída

## Critérios de conclusão

- [ ] Lambda pública consegue ler products e criar orders
- [ ] Lambda pública **não** tem permissão SES (verificar no IAM console)
- [ ] `resources.md` atualizado com a role e suas actions
- [ ] Atualizar **Status** para `concluída`
