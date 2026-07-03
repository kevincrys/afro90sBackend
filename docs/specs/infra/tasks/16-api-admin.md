# Task 16 — Rotas admin (API Gateway + Lambdas admin)

**Fase:** 3 — Rotas admin  
**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`cdk.md`](../cdk.md)

## Objetivo

Adicionar as rotas `/admin/*` ao HTTP API com o authorizer Cognito JWT e conectar às Lambdas admin (`products-admin`, `orders-admin`), já provisionadas como placeholder na task 10.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Authorizer | Cognito JWT criado na task 13 |
| Lambdas | `lambda-products-admin` e `lambda-orders-admin` (task 10) |
| Rotas admin | Todas com authorizer obrigatório |

## O que implementar

### Authorizer — aplicar nas rotas admin

- [ ] Recuperar `HttpJwtAuthorizer` criado na task 13 (via referência ou SSM)
- [ ] Aplicar `authorizer` em todas as rotas `/admin/*`

### Rotas admin

- [ ] `GET /admin/products` → `lambda-products-admin` + authorizer
- [ ] `POST /admin/products` → `lambda-products-admin` + authorizer
- [ ] `PUT /admin/products/{id}` → `lambda-products-admin` + authorizer
- [ ] `DELETE /admin/products/{id}` → `lambda-products-admin` + authorizer
- [ ] `PUT /admin/products/{id}/stock` → `lambda-products-admin` + authorizer
- [ ] `GET /admin/orders` → `lambda-orders-admin` + authorizer
- [ ] `GET /admin/orders/{id}` → `lambda-orders-admin` + authorizer
- [ ] `PUT /admin/orders/{id}` → `lambda-orders-admin` + authorizer

### Lambdas admin (já criadas na task 10)

- [x] `afro90s-{env}-lambda-products-admin` — role `role-lambda-admin` (task 15)
- [x] `afro90s-{env}-lambda-orders-admin` — mesma role admin
- [x] Variáveis de ambiente: `PRODUCTS_TABLE`, `ORDERS_TABLE`, `ASSETS_BUCKET`, `ASSETS_CDN_URL`, `SES_ENABLED=false`
- [ ] Conectar rotas HTTP API às funções existentes

### Upload de imagens (`POST /admin/products`)

- [ ] Confirmar que payload base64 passa pelo API Gateway (limite 10 MB — `binaryMediaTypes` ou upload direto via presigned URL se necessário)
- [ ] Lambda faz `PutObject` no S3 assets e retorna URL pública via `AssetsCdnUrl`

## Pré-requisitos

- [Task 15](15-iam-admin.md) concluída

## Critérios de conclusão

- [ ] `GET /admin/products` sem token retorna `401`
- [ ] `GET /admin/products` com token Cognito válido retorna `200`
- [ ] `POST /admin/products` cria produto, imagem acessível via CloudFront
- [ ] `DELETE /admin/products/{id}` remove produto do DynamoDB
- [ ] `PUT /admin/orders/{id}` atualiza status do pedido
- [ ] Rotas públicas da fase 1 continuam funcionando (regressão)
- [ ] `resources.md` e `cdk.md` atualizados
- [ ] Atualizar **Status** para `concluída`
