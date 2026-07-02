# Task 09 — SSM Parameter Store

**Fase:** 1 — Site público (parâmetros iniciais); complementado nas fases 2–4  
**Status:** pendente  
**Arquivos alvo:** [`outputs.md`](../outputs.md), [`overview.md`](../overview.md)

## Objetivo

Implementar os parâmetros SSM necessários para as rotas públicas. Parâmetros de SES são adicionados na task 18 (fase 4).

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Serviço | SSM Parameter Store **Standard** (gratuito até 10k params) |
| Quem cria | CDK `StringParameter` |
| Rotação | Fora de escopo v1 |
| `.env` local | `.gitignore` + `.env.example` sem valores |

## O que implementar

### Parâmetros da fase 1 (site público)

Criados nas respectivas stacks:

| Path | Stack que cria | Valor inicial |
|------|----------------|---------------|
| `/afro90s/{env}/products-table-name` | DatabaseStack | auto (table name) |
| `/afro90s/{env}/orders-table-name` | DatabaseStack | auto (table name) |
| `/afro90s/{env}/assets-bucket-name` | StorageStack | auto (bucket name) |
| `/afro90s/{env}/assets-bucket-arn` | StorageStack | auto (bucket ARN) |
| `/afro90s/{env}/cloudfront-web-url` | FrontendStack | auto (CF domain) |
| `/afro90s/{env}/assets-cdn-url` | StorageStack | auto (CF + /assets) |
| `/afro90s/{env}/api-base-url` | ApiStack | auto (APIGW URL) |
| `/afro90s/{env}/whatsapp-number` | ApiStack | placeholder (preencher) |

### Parâmetros adicionados em fases posteriores

| Path | Fase | Task |
|------|------|------|
| `/afro90s/{env}/cognito-user-pool-id` | 2 | task 13 |
| `/afro90s/{env}/cognito-client-id` | 2 | task 13 |
| `/afro90s/{env}/ses-from-email` | 4 | task 18 |
| `/afro90s/{env}/admin-notification-email` | 4 | task 18 |

### `.env.example`

- [ ] Criar `infra/.env.example`:
  ```
  AWS_PROFILE=kevincrys-admin
  CDK_DEFAULT_ACCOUNT=083171867610
  CDK_DEFAULT_REGION=us-east-1
  ```
- [ ] Confirmar que `infra/.env` está no `.gitignore`

### IAM para Lambdas

- [ ] Permissão `ssm:GetParameter` restrita a `/afro90s/{env}/*` (configurada nas tasks 08, 15)

## Pré-requisitos

- [Task 08](08-iam-publica.md) concluída

## Critérios de conclusão

- [ ] Parâmetros da fase 1 visíveis em SSM Parameter Store (`us-east-1`)
- [ ] Lambda consegue ler `/afro90s/dev/products-table-name` sem erro de permissão
- [ ] `.env.example` criado; `infra/.env` no `.gitignore`
- [ ] Atualizar **Status** para `concluída`
