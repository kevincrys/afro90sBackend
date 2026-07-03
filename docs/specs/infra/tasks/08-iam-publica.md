# Task 08 — IAM roles públicas

**Fase:** 1 — Site público  
**Status:** concluída  
**Arquivos alvo:** [`resources.md`](../resources.md)

## Objetivo

Criar as roles IAM das Lambdas públicas (`products-public` e `orders-public`) com least privilege. A role admin fica para a fase 3 (task 15).

> **Nota:** `POST /orders` na fase 1 cria o pedido no DynamoDB mas **não envia e-mail** (SES é fase 4). A permissão SES é adicionada na task 18.

## O que implementar

### Role `afro90s-{env}-role-lambda-products-public`

- [x] DynamoDB `products`:
  - `dynamodb:GetItem`, `dynamodb:Query`, `dynamodb:Scan`
  - Em índices: `dynamodb:Query` no `gsi-name` e `gsi-createdAt`
  - Resource: ARN específico da tabela + `ARN/index/*`
- [x] SSM:
  - `ssm:GetParameter` restrito a `/afro90s/{env}/*`
- [x] CloudWatch Logs: gerenciado automaticamente pelo CDK (não adicionar manualmente)
- [x] **SES: nenhuma permissão nesta fase**

### Role `afro90s-{env}-role-lambda-orders-public`

- [x] DynamoDB `products` (read): mesmas actions da role products-public
- [x] DynamoDB `orders`:
  - `dynamodb:PutItem`
  - Resource: ARN específico da tabela
- [x] SSM: `ssm:GetParameter` em `/afro90s/{env}/*`
- [x] **SES: nenhuma permissão nesta fase** (adicionada na task 18)

### Boas práticas

- [x] Nenhuma action com `"Resource": "*"` em policies inline
- [x] Verificar no `cdk synth` que as roles **não** têm `AdministratorAccess`
- [x] API Gateway → Lambda: permission criada automaticamente pelo CDK (task 10)

Implementação: `lib/constructs/lambda-products-public-role.ts`, `lambda-orders-public-role.ts`, instanciadas em `ApiStack`.

## Pré-requisitos

- [Task 07](07-assets-storage.md) concluída

## Critérios de conclusão

- [ ] Lambdas públicas conseguem ler products e criar orders *(validar após task 10 + deploy backend)*
- [x] Lambdas públicas **não** têm permissão SES (verificar no IAM console / testes synth)
- [x] `resources.md` atualizado com as roles e suas actions
- [x] Atualizar **Status** para `concluída`
