# Task 12 — Aceite Fase 1 (Site público)

**Fase:** 1 — Site público  
**Status:** concluída (infra — aceite manual pós-deploy)  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar que o site público está no ar com catálogo de produtos, imagens e formulário de pedido funcionando — sem login, sem admin, sem e-mail.

## O que implementar

### Script `smoke-test-fase1.sh`

- [x] `infra/scripts/smoke-test-fase1.sh` — API (stage `/{env}/…`) + CloudFront
- [x] Step final em `cdk-deploy-dev.yml`
- [x] Rotas SPA alinhadas ao frontend: `/` e `/products/{id}` (não `/catalogo`)
- [x] API: UUID inválido → `400`; UUID inexistente → `404`; `?name=cat` → `200`
- [x] `POST /orders` vazio → `400`; com produto no catálogo → `201` ou `409`
- [x] Placeholder Lambda (`503`) → SKIP na API até deploy do backend

### Backend

- [x] `scripts/smoke-test-api-fase1.sh` — subset API
- [x] Step pós-deploy em `deploy-reusable.yml` (`smoke-test` job)

## Checklist de aceite manual

- [ ] `cdk deploy --all -c env=dev` sem erros
- [ ] Todas as stacks da fase 1 com status `CREATE_COMPLETE`
- [ ] `bash infra/scripts/smoke-test-fase1.sh dev` passa (API SKIP ok se backend pendente)
- [ ] Após deploy backend: smoke API verde (sem SKIP)
- [ ] CloudFront URL abre o frontend no browser
- [ ] Rotas SPA (`/`, `/products/{uuid}`) servem `index.html`
- [ ] `GET /products` retorna JSON com `items`
- [ ] `GET /products?name=…` retorna `200` (não `500`)
- [ ] `POST /orders` com body válido retorna `201` (sem e-mail)
- [ ] Pipeline CI: PR → validate/diff; merge dev → deploy automático

## Pré-requisitos

- [Task 11](11-outputs.md) concluída

## Critérios de conclusão

- [x] Scripts de smoke test e CI configurados
- [ ] Checklist manual marcado após deploy dev/prod
- [x] `overview.md` atualizado com status da fase 1
- [x] **Status** infra: concluída — aceite runtime pendente até deploys
