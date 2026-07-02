# Spec: Outputs — Contrato para aplicações

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Documentar valores exportados pelo CDK para consumo pelos repositórios `afro90s-api` e `afro90s-web`.

## Outputs do CDK (CloudFormation)

| Output | Descrição | Consumidor |
|--------|-----------|------------|
| `ApiBaseUrl` | URL base do API Gateway | frontend, backend (testes) |
| `CloudFrontWebUrl` | URL do frontend | CI deploy SPA |
| `AssetsCdnUrl` | Base URL das imagens de produtos | backend (montar URLs), frontend |
| `CognitoUserPoolId` | ID do User Pool | frontend admin |
| `CognitoClientId` | App client ID | frontend admin |
| `CognitoRegion` | Região AWS | frontend admin |
| `ProductsTableName` | Nome tabela DynamoDB | backend Lambda |
| `OrdersTableName` | Nome tabela DynamoDB | backend Lambda |
| `AssetsBucketName` | Bucket S3 de imagens | backend Lambda |
| `SesFromEmail` | E-mail remetente SES | backend Lambda |
| `AdminNotificationEmail` | E-mail destino pedidos | backend Lambda |

## Variáveis de ambiente — Frontend (`afro90s-web`)

| Variável | Origem | Exemplo |
|----------|--------|---------|
| `VITE_API_BASE_URL` | `ApiBaseUrl` | `https://abc123.execute-api.sa-east-1.amazonaws.com/dev` |
| `VITE_ASSETS_CDN_URL` | `AssetsCdnUrl` | `https://d111111.cloudfront.net` |
| `VITE_WHATSAPP_NUMBER` | SSM / manual | `5511999999999` |
| `VITE_COGNITO_USER_POOL_ID` | `CognitoUserPoolId` | `sa-east-1_xxxxx` |
| `VITE_COGNITO_CLIENT_ID` | `CognitoClientId` | `abcdefgh` |
| `VITE_COGNITO_REGION` | `CognitoRegion` | `sa-east-1` |

## Variáveis de ambiente — Backend (`afro90s-api`)

| Variável | Origem |
|----------|--------|
| `PRODUCTS_TABLE` | `ProductsTableName` |
| `ORDERS_TABLE` | `OrdersTableName` |
| `ASSETS_BUCKET` | `AssetsBucketName` |
| `ASSETS_CDN_URL` | `AssetsCdnUrl` |
| `SES_FROM_EMAIL` | `SesFromEmail` |
| `ADMIN_EMAIL` | `AdminNotificationEmail` |
| `AWS_REGION` | região do deploy |

> Lambdas recebem essas variáveis via CDK `environment` no deploy — não commitar valores em `.env`.

## Convenções

- URLs sem barra final
- Região padrão sugerida: `sa-east-1` (ajustável por ADR futuro)
- Secrets sensíveis apenas via SSM/Secrets Manager, referenciados no CDK

## Referências

- [CDK](cdk.md)
- [Recursos](resources.md)
- [Frontend integration](../frontend/integration.md)
