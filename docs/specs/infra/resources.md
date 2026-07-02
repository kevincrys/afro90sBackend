# Spec: Recursos AWS

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Catalogar recursos AWS provisionados pelo CDK para o Afro90s.

## Resumo por serviço

| Serviço | Nome (padrão) | Propósito |
|---------|---------------|-----------|
| S3 | `afro90s-{env}-s3-web` | Build estático da SPA |
| S3 | `afro90s-{env}-s3-assets` | Imagens de produtos |
| CloudFront | `afro90s-{env}-cf-web` | CDN do frontend |
| CloudFront | `afro90s-{env}-cf-assets` | CDN das imagens (opcional: mesmo distribution com behavior `/assets/*`) |
| API Gateway | `afro90s-{env}-apigw-api` | HTTP API REST |
| Lambda | `afro90s-{env}-lambda-*` | Handlers por domínio |
| DynamoDB | `afro90s-{env}-ddb-products` | Catálogo |
| DynamoDB | `afro90s-{env}-ddb-orders` | Pedidos |
| Cognito | `afro90s-{env}-cognito-admins` | User Pool admins |
| SES | identidade de domínio/e-mail | Notificação de pedidos |
| IAM | roles por Lambda | Least privilege |

## S3 — Frontend (`s3-web`)

- Bucket **privado**; acesso apenas via CloudFront OAC/OAI
- Deploy do build Vite via CI (`aws s3 sync dist/`)
- Sem listagem pública

## S3 — Assets (`s3-assets`)

- Imagens de produtos enviadas pelo admin (`POST /admin/products`)
- Estrutura de chave: `products/{productId}/{uuid}.{ext}`
- Lambda admin com permissão `s3:PutObject`, `s3:DeleteObject`
- URLs públicas via CloudFront ou base URL configurada em output `ASSETS_CDN_URL`

## CloudFront

- Origin SPA: bucket web
- Custom error response: `403/404 → /index.html` (status 200) para SPA routing
- HTTPS obrigatório
- CORS headers se necessário para assets

## API Gateway (HTTP API)

- Stage por ambiente: `dev`, `prod`
- CORS: `Access-Control-Allow-Origin` = domínio CloudFront frontend
- Authorizer Cognito JWT nas rotas `/admin/*`
- Mapeamento de rotas: ver [api-routes.md](../backend/api-routes.md)
- Limite de payload: **10 MB** (relevante para upload base64 de imagens)

## Lambda

| Function | Rotas | Permissões |
|----------|-------|------------|
| `lambda-products-public` | `GET /products`, `GET /products/{id}` | DynamoDB products read |
| `lambda-orders-public` | `POST /orders` | DynamoDB orders write, products read, SES send |
| `lambda-products-admin` | `/admin/products*` | DynamoDB products CRUD, S3 assets write |
| `lambda-orders-admin` | `/admin/orders*` | DynamoDB orders read/update |

Runtime: **Node.js 20.x**. Bundling: esbuild.

## DynamoDB

### Tabela `products`

| Atributo | Tipo | Notas |
|----------|------|-------|
| PK `id` | String (UUID) | Partition key |
| `name` | String | |
| `nameLower` | String | Para busca case-insensitive (opcional) |
| `price` | Number | |
| `quantity` | Number | |
| `photos` | List\<String\> | URLs finais |
| `category` | String | enum |
| `createdAt` | String | ISO 8601 |
| `updatedAt` | String | ISO 8601 |

**GSI `gsi-name`**: PK `nameLower`, SK `id` — busca por prefixo de nome (v1).

Billing: **on-demand**. PITR habilitado em production.

### Tabela `orders`

| Atributo | Tipo | Notas |
|----------|------|-------|
| PK `id` | String (UUID) | |
| `status` | String | enum OrderStatus |
| `items` | List | `{ productId, quantity, unitPrice }` |
| `fullPrice` | Number | |
| `customer` | Map | `{ name, address, postalCode, tel }` |
| `createdAt` | String | |
| `updatedAt` | String | |

**GSI `gsi-status-createdAt`**: PK `status`, SK `createdAt` — listagem admin filtrada por status.

## Cognito

- User Pool: admins apenas
- `selfSignUpEnabled: false`
- App client sem secret (SPA admin)
- Grupos: `admins` (v1 único grupo)

## SES

- Identidade verificada (domínio ou e-mail)
- Template `new-order-notification` com variáveis: `orderId`, `customerName`, `fullPrice`, `itemsSummary`
- Destinatário: e-mail do admin (SSM Parameter)

## IAM

- Uma execution role por Lambda
- Sem credenciais estáticas em código
- API Gateway → Lambda via resource-based policy automática do CDK

## Referências

- [ADR-004](../../foundation/adr/004-serverless-architecture.md)
- [CDK](cdk.md)
- [API routes](../backend/api-routes.md)
