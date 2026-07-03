# Task 00 — Setup do repositório afro90s-api

**Fase:** 0 — Fundação  
**Status:** pendente  
**Repo:** `afro90s-api` (repositório separado)

## Objetivo

Criar e configurar o repositório `afro90s-api` com toda a infraestrutura de código antes de implementar qualquer handler.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Runtime | Node.js 20 + TypeScript strict |
| Framework HTTP | Middy (middleware para Lambda) |
| Bundling | esbuild no **afro90sBackend** (`npm run bundle`) |
| Deploy código | S3 + `update-function-code` ([ADR-007](../../../foundation/adr/007-backend-lambda-s3-deploy.md)) |
| Deploy config | CDK no afro90sInfra (env vars, IAM, timeout) |
| Testes | Vitest + cobertura mínima 80% |
| Linting | ESLint + Prettier |
| Lambda | Monolítico com router interno |

## O que implementar

### Estrutura de pastas

```
afro90s-api/
├── src/
│   ├── handler.ts          # entry point Lambda
│   ├── router.ts           # roteador interno
│   ├── routes/
│   │   ├── products.ts     # rotas públicas de produtos
│   │   ├── orders.ts       # rotas públicas de pedidos
│   │   └── admin/
│   │       ├── products.ts # rotas admin de produtos
│   │       └── orders.ts   # rotas admin de pedidos
│   ├── services/
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   └── email.service.ts
│   ├── lib/
│   │   ├── dynamodb.ts     # DynamoDBClient singleton
│   │   ├── s3.ts           # S3Client singleton
│   │   └── ses.ts          # SESClient singleton
│   ├── models/
│   │   ├── product.ts      # tipos + schema Zod
│   │   ├── order.ts        # tipos + schema Zod
│   │   └── errors.ts       # ApiError
│   └── utils/
│       ├── pagination.ts   # cursor Base64URL
│       └── response.ts     # helpers de resposta HTTP
├── test/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .env.example
└── .gitignore
```

### `package.json` scripts

- [ ] `"build": "tsc --noEmit"` — type check
- [ ] `"bundle": "node scripts/bundle.mjs"` — esbuild → `dist/` (deploy)
- [ ] `"package:lambda": "cd dist && zip -r ../lambda.zip ."`
- [ ] `"test": "vitest run"`
- [ ] `"test:watch": "vitest"`
- [ ] `"test:coverage": "vitest run --coverage"`
- [ ] `"lint": "eslint src test"`

### `tsconfig.json`

- [ ] `"strict": true`
- [ ] `"target": "ES2022"`
- [ ] `"module": "CommonJS"` (Lambda Node 24)
- [ ] `"outDir": "dist"`
- [ ] Excluir `node_modules`, `dist`

### `.env.example`

```
# Preenchido pelo CDK no deploy — não commitar valores reais
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

- [ ] `node_modules/`, `dist/`, `.env`, `coverage/`, `*.js.map`

### ESLint + Prettier

- [ ] `eslint.config.js` com `@typescript-eslint/recommended`
- [ ] `.prettierrc`: `{ "singleQuote": true, "semi": true, "printWidth": 100 }`

### GitHub Actions — CI

- [ ] `.github/workflows/ci.yml`:
  - Trigger: `push` e `pull_request` em qualquer branch
  - Steps: `npm ci` → `npm run build` → `npm run test:coverage` → `npm run lint`
  - Falha se cobertura < 80%

Deploy (S3 + Lambda): ver [00-deploy-api.md](00-deploy-api.md).

## Pré-requisitos

Nenhum — esta é a primeira task do backend.

## Critérios de conclusão

- [ ] `npm run build` sem erros TypeScript
- [ ] `npm test` executa sem erros (mesmo sem testes ainda — só setup)
- [ ] `npm run lint` sem erros
- [ ] Estrutura de pastas criada com arquivos vazios (`export {}`)
- [ ] `.env.example` com todas as chaves
- [ ] Atualizar **Status** para `concluída`
