# Tasks — Backend Afro90s (entregas faseadas)

Backlog de implementação da API no repositório **`afro90sBackend`** (`kevincrys/afro90sBackend`).
Organizado em **4 fases** alinhadas com [`infra/tasks/`](../../infra/tasks/README.md).

## Legenda de status

| Status | Significado |
|--------|-------------|
| `pendente` | Não iniciada |
| `em andamento` | Em implementação |
| `concluída` | Critérios de conclusão verificados |

---

## Fase 0 — Fundação

> Setup do repo, convenções, modelos, erros, paginação e repositórios DynamoDB.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 00 | [00-setup-repo.md](00-setup-repo.md) | Monorepo Lerna (`resources/` + `libs/`), Vitest, ESLint, CI |
| 00 | [00-deploy-api.md](00-deploy-api.md) | Deploy S3 + `update-function-code` |
| 01 | [01-convencoes-globais.md](01-convencoes-globais.md) | Response helpers, CORS, `X-Request-Id` |
| 02 | [02-modelos-de-dados.md](02-modelos-de-dados.md) | Schemas Zod: Product, Order, Customer |
| 03 | [03-erros-http.md](03-erros-http.md) | `ApiError`, mapeamento code → status |
| 04 | [04-paginacao-cursor.md](04-paginacao-cursor.md) | Cursor Base64URL, `parseLimit` |
| 05 | [05-dynamodb-access.md](05-dynamodb-access.md) | Repositórios products e orders + GSIs |

---

## Fase 1 — API pública

> **Entregável:** 3 rotas públicas. `POST /orders` grava no banco, **sem e-mail** (`SES_ENABLED=false`).

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 06 | [06-rota-get-products.md](06-rota-get-products.md) | `GET /products` |
| 07 | [07-rota-get-product-by-id.md](07-rota-get-product-by-id.md) | `GET /products/{id}` |
| 08 | [08-rota-post-orders.md](08-rota-post-orders.md) | `POST /orders` (sem SES) |
| 09 | [09-aceite-fase1.md](09-aceite-fase1.md) | Checklist aceite fase 1 |

**✓ Resultado:** catálogo e checkout funcionam via API.

---

## Fase 2 — Login admin

> **Entregável:** middleware auth Cognito. Rotas admin ainda não existem, mas token é aceito.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 10 | [10-auth-cognito.md](10-auth-cognito.md) | Middleware JWT + verificação grupo `admins` |
| 11 | [11-aceite-fase2.md](11-aceite-fase2.md) | Checklist aceite fase 2 |

**✓ Resultado:** token Cognito válido não recebe `401`.

---

## Fase 3 — Rotas admin

> **Entregável:** CRUD produtos com upload S3 + gestão de pedidos.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 12 | [12-upload-imagens.md](12-upload-imagens.md) | Serviço upload S3 multipart |
| 13 | [13-rotas-admin-products.md](13-rotas-admin-products.md) | 6 rotas `/admin/products*` |
| 14 | [14-rotas-admin-orders.md](14-rotas-admin-orders.md) | 3 rotas `/admin/orders*` |
| 15 | [15-aceite-fase3.md](15-aceite-fase3.md) | Checklist aceite fase 3 |

**✓ Resultado:** admin gerencia produtos e pedidos via API.

---

## Fase 4 — Email

> **Entregável:** `POST /orders` passa a enviar e-mail SES. Cobertura de testes ≥ 80%.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 16 | [16-email-ses.md](16-email-ses.md) | `email.service` com SES template |
| 17 | [17-testes-cobertura.md](17-testes-cobertura.md) | Vitest ≥ 80%, DynamoDB Local |
| 18 | [18-aceite-fase4.md](18-aceite-fase4.md) | Checklist aceite API v1 completa |

**✓ Resultado:** API v1 completa com e-mail e testes.

---

## Alinhamento com infra e frontend

| Fase | Infra | Backend | Frontend |
|------|-------|---------|----------|
| 0 | tasks 00–04 | tasks 00–05 | tasks 00–04 |
| 1 | tasks 05–12 | tasks 06–09 | tasks 05–10 |
| 2 | tasks 13–14 | tasks 10–11 | tasks 11–12 |
| 3 | tasks 15–17 | tasks 12–15 | tasks 13–15 |
| 4 | tasks 18–20 | tasks 16–18 | tasks 16–17 |

## Referências

- [API routes](../api-routes.md)
- [Data models](../data-models.md)
- [Infra tasks](../../infra/tasks/README.md)
- [Frontend tasks](../../frontend/tasks/README.md)
