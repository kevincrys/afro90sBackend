# Task 00 — Setup do repositório afro90sBackend

**Fase:** 0 — Fundação  
**Status:** pendente  
**Repo:** `afro90sBackend`  
**ADR:** [008-backend-monorepo-lerna](../../../foundation/adr/008-backend-monorepo-lerna.md)

## Objetivo

Criar e configurar o monorepo **afro90sBackend** (Lerna + workspaces) antes de implementar handlers e libs.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Layout | `resources/{flow}/` + `libs/` |
| Monorepo | Lerna + npm workspaces |
| Runtime | Node.js 20 + TypeScript strict |
| Framework HTTP | Middy (um `handler.ts` por package em `resources/`) |
| Bundling | esbuild por fluxo (`scripts/bundle.mjs {flow}`) |
| Deploy código | S3 + `update-function-code` ([ADR-007](../../../foundation/adr/007-backend-lambda-s3-deploy.md)) |
| Deploy config | CDK no afro90sInfra |
| Testes | Vitest + cobertura mínima 80% (agregada na raiz) |
| Linting | ESLint + Prettier (raiz + packages) |
| Lambdas | **4 packages** em `resources/` — nomes = fluxos AWS |

## O que implementar

### Estrutura de pastas

```
afro90sBackend/
├── lerna.json
├── package.json
├── tsconfig.base.json
├── vitest.config.ts
├── libs/
│   └── (criados incrementalmente pelas tasks 01–05)
├── resources/
│   ├── products-public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/handler.ts
│   ├── orders-public/
│   ├── products-admin/
│   └── orders-admin/
├── scripts/
│   ├── bundle.mjs
│   ├── package-lambda.mjs
│   ├── flows.sh
│   └── deploy-flow.sh
└── test/                      # integration (opcional)
```

### Raiz — `package.json`

- [ ] `"workspaces": ["resources/*", "libs/*"]`
- [ ] `"build": "lerna run build"` — `tsc --noEmit` em cada package
- [ ] `"test": "vitest run"` / `"test:coverage": "vitest run --coverage"`
- [ ] `"lint": "eslint resources libs test"`
- [ ] `"bundle": "node scripts/bundle.mjs"` — todos os fluxos, ou `bundle -- --flow=…`

### `lerna.json`

- [ ] `"packages": ["resources/*", "libs/*"]`
- [ ] `"version": "independent"` ou fixo `0.1.0` (v1: independent ok)

### Cada `resources/{flow}/package.json`

- [ ] `"name": "@afro90s/{flow}"`
- [ ] `"main": "dist/handler.js"`
- [ ] `"scripts": { "build": "tsc --noEmit", "bundle": "node ../../scripts/bundle.mjs {flow}" }`
- [ ] `dependencies` com `workspace:*` nas libs usadas

### `tsconfig.base.json`

- [ ] `strict: true`, `target: ES2022`, `module: CommonJS`
- [ ] Packages estendem via `"extends": "../../tsconfig.base.json"`

### `.env.example` (raiz)

```
# Preenchido pelo CDK — não commitar valores reais
PRODUCTS_TABLE=
ORDERS_TABLE=
ASSETS_BUCKET=
ASSETS_CDN_URL=
SES_FROM_EMAIL=
ADMIN_EMAIL=
SES_TEMPLATE_NAME=
SES_ENABLED=false
AWS_REGION=us-east-1
```

### `.gitignore`

- [ ] `node_modules/`, `**/dist/`, `.env`, `coverage/`, `**/lambda.zip`, `*.js.map`

### ESLint + Prettier

- [ ] `eslint.config.js` na raiz cobrindo `resources/`, `libs/`, `test/`
- [ ] `.prettierrc` na raiz

### GitHub Actions — CI

- [ ] `.github/workflows/ci.yml`:
  - `npm ci` → `npm run build` → `npm run test:coverage` → `npm run lint`

### Deploy

- [x] `scripts/deploy-flow.sh` — S3 + Lambda por fluxo (SSM)
- Ver [00-deploy-api.md](00-deploy-api.md)

## Pré-requisitos

Nenhum — primeira task do backend.

## Critérios de conclusão

- [ ] `lerna.json` + workspaces configurados
- [ ] 4 packages em `resources/` com `handler.ts` placeholder (`export {}` ou stub)
- [ ] `npm run build` sem erros TypeScript
- [ ] `npm test` executa (mesmo só com testes stub)
- [ ] `npm run lint` sem erros
- [ ] `.env.example` com todas as chaves
- [ ] Atualizar **Status** para `concluída`

## Referências

- [overview.md](../overview.md)
- [00-deploy-api.md](00-deploy-api.md)
