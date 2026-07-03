# Task 06 — Frontend hosting (S3 + CloudFront)

**Fase:** 1 — Site público  
**Status:** concluída  
**Arquivos alvo:** [`resources.md`](../resources.md), [`cdk.md`](../cdk.md)

## Objetivo

Implementar `FrontendStack`: bucket S3 privado + distribuição CloudFront com OAC para hospedar a SPA React.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Acesso S3 | OAC (Origin Access Control) |
| SPA routing | Custom error `403 → /index.html` (status 200); `404` real permanece |
| Domínio customizado | Base preparada, domínio ainda a comprar |
| HTTPS | Redirect obrigatório HTTP → HTTPS |
| Cache `index.html` | `no-cache` (TTL 0) |
| Cache assets com hash | Cache longo (1 ano) |
| Deploy SPA | `aws s3 sync` no CI + invalidação CloudFront |
| S3 versioning (web) | **Desligado** — rollback = redeploy anterior |
| S3 lifecycle (web) | Só abort multipart incompleto (7d); **sem** expiração de objetos ativos |
| CloudFront Price Class | `PriceClass_200` (inclui Brasil, menor que `All`) |

## O que implementar

### S3 — bucket web

- [x] Nome: `afro90s-{env}-s3-web`
- [x] `blockPublicAccess: BlockPublicAccess.BLOCK_ALL`
- [x] `versioned: false` dev e prod
- [x] `removalPolicy: DESTROY` dev / `RETAIN` prod
- [x] `autoDeleteObjects: true` dev
- [x] Lifecycle: abort multipart incompleto (7d) — não expira `index.html` nem assets em uso

### CloudFront — distribuição web

- [x] Origin: bucket web via `S3BucketOrigin.withOriginAccessControl()`
- [x] `priceClass: PriceClass.PRICE_CLASS_200`
- [x] `defaultRootObject: 'index.html'`
- [x] Viewer protocol: `REDIRECT_TO_HTTPS`
- [x] Custom error response: `403 → /index.html (200)` (S3+OAC devolve 403 em rotas inexistentes)
- [x] Cache policy `index.html`: `CachePolicy.CACHING_DISABLED`
- [x] Cache policy `assets/*` (hashed): `CachePolicy.CACHING_OPTIMIZED`
- [x] Alias de domínio: campo `domainNames` preenchido com `config.domainName` se definido (placeholder para quando o domínio for comprado)
- [x] Security headers via `ResponseHeadersPolicy`: HSTS, X-Content-Type-Options

> Behavior `/assets/*` para imagens de produtos é adicionado na [task 07](07-assets-storage.md).

> `Cache-Control` nos objetos S3 (`no-cache` / `max-age=31536000`) é aplicado no **deploy CI** do frontend (`aws s3 sync`).

### Exports via SSM

- [x] `/afro90s/{env}/cloudfront-web-url` — URL da distribuição (sem barra final)

### Outputs CloudFormation

- [x] `CfnOutput` `CloudFrontWebUrl`

## Pré-requisitos

- [Task 05](05-dynamodb.md) concluída

## Critérios de conclusão

- [ ] URL CloudFront acessível (`https://*.cloudfront.net`)
- [ ] `index.html` servido em qualquer rota interna (SPA routing)
- [ ] Assets com `Cache-Control: max-age=31536000`
- [ ] `index.html` com `Cache-Control: no-cache`
- [ ] URL S3 direta retorna 403
- [ ] Output `CloudFrontWebUrl` no CloudFormation
- [x] `resources.md` atualizado
- [x] Atualizar **Status** para `concluída`
