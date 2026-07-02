# Task 16 — Rotas admin (API Gateway + Lambda admin)

**Fase:** 3 — Rotas admin  
**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`cdk.md`](../cdk.md)

## Objetivo

Adicionar as rotas `/admin/*` ao HTTP API com o authorizer Cognito JWT e conectar à Lambda admin (ou expandir o router da Lambda existente).

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Authorizer | Cognito JWT criado na task 13 |
| Lambda | Mesma função da fase 1 (router interno ampliado) ou segunda função |
| Rotas admin | Todas com authorizer obrigatório |

## O que implementar

### Authorizer — aplicar nas rotas admin

- [ ] Recuperar `HttpJwtAuthorizer` criado na task 13 (via referência ou SSM)
- [ ] Aplicar `authorizer` em todas as rotas `/admin/*`

### Rotas admin

- [ ] `GET /admin/products` → Lambda admin + authorizer
- [ ] `POST /admin/products` → Lambda admin + authorizer
- [ ] `PUT /admin/products/{id}` → Lambda admin + authorizer
- [ ] `DELETE /admin/products/{id}` → Lambda admin + authorizer
- [ ] `PUT /admin/products/{id}/stock` → Lambda admin + authorizer
- [ ] `GET /admin/orders` → Lambda admin + authorizer
- [ ] `GET /admin/orders/{id}` → Lambda admin + authorizer
- [ ] `PUT /admin/orders/{id}` → Lambda admin + authorizer

### Lambda admin

Opção A — mesma Lambda da fase 1 (router interno expandido):
- [ ] Atualizar `ApiStack` para passar role admin à função existente
- [ ] Handler reconhece rotas `/admin/*` e usa lógica admin

Opção B — Lambda separada (recomendado para isolamento de IAM):
- [ ] Criar `afro90s-{env}-lambda-admin` com:
  - Mesmas configurações de runtime/timeout/memory da Lambda pública
  - Role: `afro90s-{env}-role-lambda-admin` (task 15)
  - Variáveis de ambiente: `PRODUCTS_TABLE`, `ORDERS_TABLE`, `ASSETS_BUCKET`, `ASSETS_CDN_URL`
  - `SES_ENABLED=false` ← permanece false até fase 4

> Escolher uma opção e registrar no `cdk.md`.

### Upload de imagens (`POST /admin/products`)

- [ ] Confirmar que payload base64 passa pelo API Gateway (limite 10 MB — `binaryMediaTypes` ou upload direto via presigned URL se necessário)
- [ ] Lambda faz `PutObject` no S3 assets e retorna URL pública via `AssetsCdnUrl`

## Pré-requisitos

- Tasks 13 (Cognito + authorizer), 15 (IAM admin) concluídas

## Critérios de conclusão

- [ ] `GET /admin/products` sem token retorna `401`
- [ ] `GET /admin/products` com token Cognito válido retorna `200`
- [ ] `POST /admin/products` cria produto, imagem acessível via CloudFront
- [ ] `DELETE /admin/products/{id}` remove produto do DynamoDB
- [ ] `PUT /admin/orders/{id}` atualiza status do pedido
- [ ] Rotas públicas da fase 1 continuam funcionando (regressão)
- [ ] `resources.md` e `cdk.md` atualizados
- [ ] Atualizar **Status** para `concluída`
