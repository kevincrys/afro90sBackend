# Task 07 — Assets storage (imagens de produtos)

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`outputs.md`](../outputs.md)

## Objetivo

Implementar `StorageStack`: bucket S3 privado de imagens com entrega via behavior `/assets/*` na distribuição CloudFront da [task 06](06-frontend-hosting.md).

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| CDN | Behavior `/assets/*` na distribuição `cf-web` (não distribuição separada) |
| Acesso público | OAC via CloudFront |
| Estrutura de chave | `products/{productId}/{uuid}.{ext}` |
| Upload | Via Lambda admin somente (fase 3) |
| Encryption | SSE-S3 (padrão AWS, sem custo extra) |
| Lifecycle orphans | Fora de escopo v1 |

## O que implementar

### S3 — bucket assets

- [ ] Nome: `afro90s-{env}-s3-assets`
- [ ] `blockPublicAccess: BlockPublicAccess.BLOCK_ALL`
- [ ] `encryption: BucketEncryption.S3_MANAGED`
- [ ] `versioned: false` (imagens substituídas por UUID novo)
- [ ] `removalPolicy: DESTROY` dev / `RETAIN` prod
- [ ] Sem configuração CORS (upload somente via Lambda, não browser)

### CloudFront — behavior `/assets/*`

- [ ] Adicionar origin do bucket assets na distribuição criada na [task 06](06-frontend-hosting.md)
  - `S3BucketOrigin.withOriginAccessControl()` para bucket assets
- [ ] `additionalBehaviors['assets/*']`:
  - `allowedMethods: AllowedMethods.ALLOW_GET_HEAD`
  - `cachePolicy: CachePolicy.CACHING_OPTIMIZED`
  - `viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS`

> A distribuição CloudFront pertence ao `FrontendStack` (task 06). O `StorageStack` exporta o bucket via SSM para que o `FrontendStack` adicione o behavior.

### Exports via SSM

- [ ] `/afro90s/{env}/assets-bucket-name`
- [ ] `/afro90s/{env}/assets-bucket-arn`

### Outputs CloudFormation

- [ ] `CfnOutput` `AssetsBucketName`
- [ ] `CfnOutput` `AssetsCdnUrl` = `https://{cf-domain}/assets` (sem barra final)

## Pré-requisitos

- [Task 06](06-frontend-hosting.md) concluída (CloudFront web deployado)

## Critérios de conclusão

- [ ] Imagem salva em `products/test/uuid.jpg` acessível via `{AssetsCdnUrl}/products/test/uuid.jpg`
- [ ] URL S3 direta retorna 403
- [ ] Outputs `AssetsBucketName` e `AssetsCdnUrl` no CloudFormation
- [ ] `resources.md` e `outputs.md` atualizados
- [ ] Atualizar **Status** para `concluída`
