# Task 12 — Upload de imagens (S3)

**Fase:** 3 — Rotas admin  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar serviço de upload de imagens de produtos para S3, consumido pelas rotas admin de produtos.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Modo de upload | Multipart (stream) |
| Chave S3 | `products/{productId}/{uuid}.{ext}` |
| URL retornada | Absoluta: `{ASSETS_CDN_URL}/products/...` |
| Limite por imagem | 10 MB |
| Formatos aceitos | `image/jpeg`, `image/png`, `image/webp` |
| Encryption | SSE-S3 (bucket padrão) |

## O que implementar

### `src/lib/s3.ts`

- [ ] Singleton `S3Client`
- [ ] Bucket via env: `ASSETS_BUCKET`
- [ ] CDN base via env: `ASSETS_CDN_URL`

### `src/services/image.service.ts`

- [ ] `uploadProductImage(productId, file: { buffer, mimeType, filename })`:
  - Validar mime type
  - Validar tamanho ≤ 10 MB
  - Gerar UUID para nome do arquivo
  - `PutObject` em `products/{productId}/{uuid}.{ext}`
  - Retornar URL pública: `${ASSETS_CDN_URL}/products/${productId}/${uuid}.${ext}`
- [ ] `deleteProductImage(key)` → `DeleteObject`

### Testes

- [ ] Upload válido retorna URL absoluta
- [ ] Mime inválido → erro de validação
- [ ] Arquivo > 10 MB → erro de validação

## Pré-requisitos

- Fase 2 entregue
- Infra fase 3 (S3 assets) deployada

## Critérios de conclusão

- [ ] Serviço de upload testado com S3 mock
- [ ] URL retornada é absoluta (não relativa)
- [ ] Atualizar **Status** para `concluída`
