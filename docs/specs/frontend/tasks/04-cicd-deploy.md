# Task 04 — CI/CD e deploy (S3 + CloudFront)

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md)

## Objetivo

Configurar pipeline GitHub Actions para build e deploy da SPA no S3/CloudFront do `afro90sInfra`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| CI | GitHub Actions no repo `afro90s-web` |
| Deploy | `aws s3 sync dist/` + invalidação CloudFront |
| Env no CI | Injetadas a partir de outputs da infra |
| `base` Vite | `/` (raiz do CloudFront) |
| Preview deployments | Fora de escopo v1 |
| Ordem deploy | Infra primeiro, depois frontend |

## O que implementar

### `.github/workflows/deploy-dev.yml`

- [ ] Trigger: `push` em branch `dev`
- [ ] Steps:
  1. Checkout
  2. Node 20 + `npm ci`
  3. Injetar `VITE_*` do artifact `outputs-dev.json` da infra (ou GitHub vars)
  4. `npm run build`
  5. `aws s3 sync dist/ s3://afro90s-dev-s3-web --delete`
  6. `aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*"`

### `.github/workflows/deploy-prod.yml`

- [ ] Trigger: `push` em `main`
- [ ] Environment: `production`
- [ ] Mesmos steps com `prod`

### `.github/workflows/ci.yml`

- [ ] Trigger: PR e push
- [ ] Steps: `npm ci` → `npm run build` → `npm test` → `npm run lint`

### Variáveis necessárias

| Variável | Origem |
|----------|--------|
| `VITE_API_BASE_URL` | Infra output `ApiBaseUrl` |
| `VITE_ASSETS_CDN_URL` | Infra output `AssetsCdnUrl` |
| `VITE_WHATSAPP_NUMBER` | SSM `/afro90s/{env}/whatsapp-number` |
| `VITE_COGNITO_*` | Infra outputs (fase 2+) |

### Auth AWS no workflow

- [ ] OIDC (mesmo padrão da infra) — role com permissão S3 sync + CloudFront invalidation

## Pré-requisitos

- Task 00 concluída
- Infra task 04 (CI/CD) e task 06 (frontend hosting) deployadas

## Critérios de conclusão

- [ ] Merge em `dev` → SPA acessível em `CloudFrontWebUrl`
- [ ] `npm run build` no CI sem erros
- [ ] `integration.md` tabela `VITE_*` atualizada
- [ ] Atualizar **Status** para `concluída`
