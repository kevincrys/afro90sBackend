# Task 06 — Frontend hosting (S3 + CloudFront)

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`resources.md](../resources.md), [`cdk.md`](../cdk.md)

## Objetivo

Implementar `FrontendStack`: bucket S3 privado + distribuição CloudFront com OAC para hospedar a SPA React.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Acesso S3 | OAC (Origin Access Control) |
| SPA routing | Custom error `403/404 → /index.html` (status 200) |
| Domínio customizado | Base preparada, domínio ainda a comprar |
| HTTPS | Redirect obrigatório HTTP → HTTPS |
| Cache `index.html` | `no-cache` (TTL 0) |
| Cache assets com hash | Cache longo (1 ano) |
| Deploy SPA | `aws s3 sync` no CI + invalidação CloudFront |
| CloudFront Price Class | `PriceClass_200` (inclui Brasil, menor que `All`) |

## O que implementar

### S3 — bucket web

- [ ] Nome: `afro90s-{env}-s3-web`
- [ ] `blockPublicAccess: BlockPublicAccess.BLOCK_ALL`
- [ ] `versioned: false` dev / `true` prod
- [ ] `removalPolicy: DESTROY` dev / `RETAIN` prod
- [ ] `autoDeleteObjects: true` dev

### CloudFront — distribuição web

- [ ] Origin: bucket web via `S3BucketOrigin.withOriginAccessControl()`
- [ ] `priceClass: PriceClass.PRICE_CLASS_200`
- [ ] `defaultRootObject: 'index.html'`
- [ ] Viewer protocol: `REDIRECT_TO_HTTPS`
- [ ] Custom error responses: `403 → /index.html (200)` e `404 → /index.html (200)`
- [ ] Cache policy `index.html`: `CachePolicy.CACHING_DISABLED`
- [ ] Cache policy `assets/*` (hashed): `CachePolicy.CACHING_OPTIMIZED`
- [ ] Alias de domínio: campo `domainNames` preenchido com `config.domainName` se definido (placeholder para quando o domínio for comprado)
- [ ] Security headers via `ResponseHeadersPolicy`: HSTS, X-Content-Type-Options

> Behavior `/assets/*` para imagens de produtos é adicionado na [task 07](07-assets-storage.md).

### Exports via SSM

- [ ] `/afro90s/{env}/cloudfront-web-url` — URL da distribuição (sem barra final)

### Outputs CloudFormation

- [ ] `CfnOutput` `CloudFrontWebUrl`

## Pré-requisitos

- [Task 05](05-dynamodb.md) concluída

## Critérios de conclusão

- [ ] URL CloudFront acessível (`https://*.cloudfront.net`)
- [ ] `index.html` servido em qualquer rota interna (SPA routing)
- [ ] Assets com `Cache-Control: max-age=31536000`
- [ ] `index.html` com `Cache-Control: no-cache`
- [ ] URL S3 direta retorna 403
- [ ] Output `CloudFrontWebUrl` no CloudFormation
- [ ] `resources.md` atualizado
- [ ] Atualizar **Status** para `concluída`
