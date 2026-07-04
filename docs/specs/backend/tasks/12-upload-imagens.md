# Task 12 — Upload de imagens (S3)

**Fase:** 3 — Rotas admin  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar serviço de upload de imagens de produtos para S3, consumido pelas rotas admin de produtos.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Modo de upload | Multipart (stream) |
| Chave S3 | `products/{productId}/{uuid}.{ext}` |
| URL retornada | Absoluta: `{ASSETS_CDN_URL}/products/...` |
| Limite por imagem | 5 MB ([api-routes.md](../api-routes.md)) |
| Formatos aceitos | `image/jpeg`, `image/png`, `image/webp` |
| Encryption | SSE-S3 (bucket padrão) |

## O que implementar

### `@afro90s/storage` — `libs/storage/src/client.ts`

- [x] Singleton `S3Client`
- [x] Bucket via env: `ASSETS_BUCKET`
- [x] CDN base via env: `ASSETS_CDN_URL`

### `@afro90s/storage` — `libs/storage/src/image.service.ts`

- [x] `ImageService.uploadProductImage(productId, file: { buffer, mimeType, filename })`:
  - Validar mime type
  - Validar tamanho ≤ 5 MB
  - Gerar UUID para nome do arquivo
  - `PutObject` em `products/{productId}/{uuid}.{ext}`
  - Retornar URL pública: `${ASSETS_CDN_URL}/products/${productId}/${uuid}.${ext}`
- [x] `deleteProductImage(key)` → `DeleteObject` (aceita key S3 ou URL CDN)
- [x] `createImageService()` — factory com env vars

### Testes

- [x] Upload válido retorna URL absoluta
- [x] Mime inválido → `INVALID_IMAGE`
- [x] Arquivo > 5 MB → `PAYLOAD_TOO_LARGE`

### Modelos

- [x] Códigos `INVALID_IMAGE` e `PAYLOAD_TOO_LARGE` em `@afro90s/models`

## Pré-requisitos

- Fase 2 entregue
- Infra fase 3 (S3 assets) deployada

## Critérios de conclusão

- [x] Serviço de upload testado com S3 mock
- [x] URL retornada é absoluta (não relativa)
- [x] Atualizar **Status** para `concluída`
