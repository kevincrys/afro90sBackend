# Task 01 — Convenções globais da API

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), `libs/http/`

## Objetivo

Implementar convenções transversais em **`libs/http`** e wiring em cada **`resources/{flow}/src/handler.ts`**.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Região | `us-east-1` |
| Stages | `dev` e `prod` |
| CORS origem | CloudFront URL por ambiente (env var) |
| `X-Request-Id` | Gerado na Lambda se ausente (UUID v4) |
| Charset | UTF-8 em todas as respostas |
| Versionamento no path | Não (`/products`, não `/v1/products`) |
| Rate limit | Throttle do API Gateway (infra) |

## O que implementar

### `libs/http` (`@afro90s/http`)

- [ ] `ok(body)`, `created(body)`, `noContent()`, `error(statusCode, code, message, details?)`
- [ ] Headers obrigatórios: `Content-Type: application/json; charset=utf-8`, `X-Request-Id`
- [ ] Helpers CORS: `corsHeaders(origin)`, resposta `OPTIONS`
- [ ] `Access-Control-Allow-Origin`: `CLOUDFRONT_WEB_URL` (env)
- [ ] Local: aceitar `http://localhost:5173` se `NODE_ENV=development`

### `resources/{flow}/src/handler.ts`

Cada Lambda tem **apenas as rotas do seu fluxo** (sem router monolítico):

- [ ] Middy: `httpRouterHandler` ou roteamento manual **no package**
- [ ] Extrair/gerar `X-Request-Id`; propagar no contexto
- [ ] Catch global → `500 INTERNAL_ERROR` com `requestId`
- [ ] `products-public` / `orders-public`: sem auth
- [ ] `products-admin` / `orders-admin`: integrar `libs/auth` na fase 2

### Formato base URL

- [ ] `{ApiBaseUrl}/{stage}/{path}` — `ApiBaseUrl` sem stage e sem barra final

## Pré-requisitos

- Task 00 concluída (monorepo + 4 packages em `resources/`)

## Critérios de conclusão

- [ ] `libs/http` coberto por testes unitários
- [ ] Cada `handler.ts` retorna `X-Request-Id` nas respostas
- [ ] `api-routes.md` seção "Convenções globais" atualizada
- [ ] Atualizar **Status** para `concluída`
