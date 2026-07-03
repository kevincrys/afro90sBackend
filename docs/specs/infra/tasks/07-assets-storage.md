# Task 07 — Assets storage (imagens de produtos)

**Fase:** 1 — Site público  
**Status:** concluída  
**Arquivos alvo:** [`resources.md`](../resources.md), [`outputs.md`](../outputs.md)

## Objetivo

Implementar `StorageStack`: bucket S3 privado de imagens com entrega via behavior `/assets/products/*` na distribuição CloudFront da [task 06](06-frontend-hosting.md).

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| CDN | Behavior `/assets/products/*` na distribuição `cf-web` (coexiste com `/assets/*` do Vite no bucket web) |
| Acesso público | OAC via CloudFront |
| Estrutura de chave | `products/{productId}/{uuid}.{ext}` |
| URL pública | `{AssetsCdnUrl}/products/{productId}/{uuid}.{ext}` |
| Rewrite CDN | CloudFront Function remove prefixo `/assets` antes de buscar no bucket |
| Upload | Via Lambda admin somente (fase 3) |
| Encryption | SSE-S3 (padrão AWS, sem custo extra) |
| Lifecycle orphans | Fora de escopo v1 |

## O que implementar

### S3 — bucket assets

- [x] Nome: `afro90s-{env}-s3-assets`
- [x] `blockPublicAccess: BlockPublicAccess.BLOCK_ALL`
- [x] `encryption: BucketEncryption.S3_MANAGED`
- [x] `versioned: false` (imagens substituídas por UUID novo)
- [x] `removalPolicy: DESTROY` dev / `RETAIN` prod
- [x] Sem configuração CORS (upload somente via Lambda, não browser)

### CloudFront — behavior imagens de produtos

- [x] Origin do bucket assets na distribuição `FrontendStack` (`S3BucketOrigin.withOriginAccessControl()`)
- [x] `additionalBehaviors['assets/products/*']`:
  - `allowedMethods: AllowedMethods.ALLOW_GET_HEAD`
  - `cachePolicy: CachePolicy.CACHING_OPTIMIZED`
  - `viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS`
  - CloudFront Function: `/assets/products/...` → `/products/...` no origin S3
- [x] `assets/*` (Vite) permanece no bucket **web** (task 06)

### Exports via SSM

- [x] `/afro90s/{env}/assets-bucket-name` — `StorageStack`
- [x] `/afro90s/{env}/assets-bucket-arn` — `StorageStack`
- [x] `/afro90s/{env}/assets-cdn-url` — `FrontendStack` (depende do domínio CloudFront)

### Outputs CloudFormation

- [x] `CfnOutput` `AssetsBucketName` — `StorageStack`
- [x] `CfnOutput` `AssetsCdnUrl` = `https://{cf-domain}/assets` — `FrontendStack`

## Pré-requisitos

- [Task 06](06-frontend-hosting.md) concluída (CloudFront web deployado)

## Critérios de conclusão

- [ ] Imagem salva em `products/test/uuid.jpg` acessível via `{AssetsCdnUrl}/products/test/uuid.jpg`
- [ ] URL S3 direta retorna 403
- [ ] Outputs `AssetsBucketName` e `AssetsCdnUrl` no CloudFormation
- [x] `resources.md` e `outputs.md` atualizados
- [x] Atualizar **Status** para `concluída`
