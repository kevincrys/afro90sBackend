# Task 11 — Outputs e script de exportação

**Fase:** 1 — Site público (outputs iniciais); complementado nas fases 2–4  
**Status:** pendente  
**Arquivos alvo:** [`outputs.md`](../outputs.md)

## Objetivo

Garantir que todos os `CfnOutput` da fase 1 estejam corretos e criar o script `export-outputs.sh` para consumo pelos repos de app.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Consumo pelos apps | Arquivo JSON gerado por script CI pós-deploy |
| `ApiBaseUrl` | Sem stage, sem barra final |
| Nenhum secret em outputs | Confirmado |
| URLs | Sem barra final em todos |

## O que implementar

### CfnOutputs da fase 1

Verificar que cada stack exporta seus outputs ao final desta fase:

| Stack | Output | Fase |
|-------|--------|------|
| FrontendStack | `CloudFrontWebUrl` | 1 |
| StorageStack | `AssetsBucketName` | 1 |
| StorageStack | `AssetsCdnUrl` | 1 |
| ApiStack | `ApiBaseUrl` | 1 |
| DatabaseStack | `ProductsTableName` | 1 |
| DatabaseStack | `OrdersTableName` | 1 |
| AuthStack | `CognitoUserPoolId` | 2 |
| AuthStack | `CognitoClientId` | 2 |
| AuthStack | `CognitoRegion` | 2 |
| ApiStack | `SesFromEmail` | 4 |
| ApiStack | `AdminNotificationEmail` | 4 |

- [ ] Todos com `exportName` estável (não muda entre deploys)
- [ ] Nenhum output com senha, token ou secret

### Script `export-outputs.sh`

- [ ] Criar `infra/scripts/export-outputs.sh`:

```bash
#!/bin/bash
set -e
ENV=${1:-dev}
aws cloudformation describe-stacks \
  --region us-east-1 \
  --query "Stacks[?contains(StackName,'afro90s-${ENV}')].Outputs[]" \
  --output json > "infra/outputs-${ENV}.json"
echo "Outputs salvos em infra/outputs-${ENV}.json"
```

- [ ] Adicionar `infra/outputs-*.json` ao `.gitignore`
- [ ] Script chamado no CI após `cdk deploy` (task 04)

### Injeção de variáveis de ambiente na Lambda

- [ ] Confirmar que `ApiStack` passa via `environment` no construct Lambda:
  - Fase 1: `PRODUCTS_TABLE`, `ORDERS_TABLE`, `ASSETS_BUCKET`, `ASSETS_CDN_URL`, `AWS_REGION`, `SES_ENABLED=false`
  - Fase 4: adicionar `SES_FROM_EMAIL`, `ADMIN_EMAIL`, `SES_ENABLED=true`

## Pré-requisitos

- [Task 10](10-api-publica.md) concluída

## Critérios de conclusão

- [ ] `export-outputs.sh dev` gera JSON com todos os outputs da fase 1
- [ ] `outputs-dev.json` no `.gitignore`
- [ ] `outputs.md` com tabela completa atualizada
- [ ] Atualizar **Status** para `concluída`
