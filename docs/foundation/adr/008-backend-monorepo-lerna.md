# ADR-008: Monorepo Lerna — `resources/` + `libs/`

**Status:** Aceito  
**Data:** 2026-07-02  
**Autores:** Equipe Afro90s

## Contexto

O backend expõe **4 funções Lambda** (uma por fluxo de API). A spec inicial previa um único package com `src/handlers/` e bundle compartilhado — isso não escala para deploy independente, testes por domínio e reuso explícito de código.

Requisito: cada Lambda com **package próprio**, código compartilhado em **libs**, sem impactar o contrato com **afro90sInfra** (handler `handler.handler`, S3 `{flow}/latest.zip`, SSM).

## Decisão

Organizar **afro90sBackend** como monorepo **Lerna + npm workspaces**:

| Pasta | Conteúdo |
|-------|----------|
| `resources/{flow}/` | 1 package = 1 Lambda (`src/handler.ts`, rotas do fluxo) |
| `libs/{nome}/` | Packages compartilhados (models, http, repositories, …) |
| Raiz | `lerna.json`, `package.json` workspaces, CI, scripts de bundle/deploy |

### Fluxos (= nomes das pastas em `resources/`)

`products-public`, `orders-public`, `products-admin`, `orders-admin`

O nome da pasta **é** o `flow` do deploy (SSM, S3, matrix CI).

### Naming de packages npm

| Path | Package name |
|------|----------------|
| `resources/products-public` | `@afro90s/products-public` |
| `libs/models` | `@afro90s/models` |
| `libs/http` | `@afro90s/http` |

Dependências internas: `"@afro90s/models": "workspace:*"`.

### Bundle e artefato

- esbuild por package em `resources/{flow}/`
- Output: `resources/{flow}/dist/handler.js` → zip com `handler.js` na **raiz** (contrato `handler.handler` da infra)
- **1 zip por fluxo** — não compartilhar zip entre Lambdas

### Contrato com afro90sInfra (inalterado)

| Item | Valor |
|------|-------|
| Handler runtime | `handler.handler` |
| S3 key | `{flow}/latest.zip` |
| Nome da função | SSM `/afro90s/{env}/lambda-{flow}-name` |
| Env vars / IAM | CDK |

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| Single package `src/` | Bundle único; acoplamento entre 4 Lambdas |
| Prefixo `resource-*` nos packages | Ruído; pasta `resources/` já comunica o papel |
| `lerna.json` por Lambda | Padrão Lerna usa um config na raiz |
| Nx / Turborepo | Lerna suficiente para 4 Lambdas + poucas libs na v1 |

## Consequências

**Positivas**

- Deploy 1:1 com fluxos AWS e matrix CI existente
- Libs versionadas e testáveis isoladamente
- Evolução independente por domínio (ex.: só `orders-public` no PR)

**Negativas**

- Setup inicial mais complexo (workspaces, tsconfig references)
- CI deve agregar cobertura de todos os packages (Vitest projects na raiz)
- Tasks de implementação referenciam paths em `libs/` e `resources/`

## Referências

- [ADR-007](007-backend-lambda-s3-deploy.md)
- [backend/overview.md](../../specs/backend/overview.md)
- [backend/tasks/00-setup-repo.md](../../specs/backend/tasks/00-setup-repo.md)
- [backend/tasks/00-deploy-api.md](../../specs/backend/tasks/00-deploy-api.md)
