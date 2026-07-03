# Task 01 — Convenções globais da API

**Fase:** 0 — Fundação  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), `libs/http/`

## Objetivo

Implementar convenções transversais em `libs/http` e documentar contratos HTTP base que todas as rotas seguem.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Região | `us-east-1` |
| Stages | `dev` e `prod` |
| CORS origem | CloudFront URL por ambiente (SSM) |
| `X-Request-Id` | Gerado na Lambda se ausente (UUID v4) |
| Charset | UTF-8 em todas as respostas |
| Versionamento no path | Não (`/products`, não `/v1/products`) |
| Rate limit | Somente no throttle do API Gateway (infra) |

## Idioma das mensagens

| Tipo | Idioma | Exemplo |
|------|--------|---------|
| Erros de desenvolvedor/operador (`throw`, CI, logs) | **English** | `Invalid env: staging. Expected 'dev' or 'prod'.` |
| Respostas HTTP para clientes (`ApiError.message`) | **pt-BR** | `'Produto não encontrado.'` |
| Códigos de erro (`ApiError.code`) | **English** (snake/SCREAMING) | `NOT_FOUND`, `VALIDATION_ERROR` |

## O que implementar

### `libs/http/src/response.ts`

- [x] Função `ok(body)` → `{ statusCode: 200, headers, body: JSON.stringify(body) }`
- [x] Função `created(body)` → `{ statusCode: 201, ... }`
- [x] Função `noContent()` → `{ statusCode: 204, headers, body: '' }`
- [x] Função `apiError(statusCode, code, message, details?)` → corpo `ApiError`
- [x] Headers obrigatórios em todas as respostas:
  ```typescript
  {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Request-Id': requestId,
  }
  ```

### `resources/{flow}/src/handler.ts` — entry point com Middy

- [x] `createHandler()` em `@afro90s/http` (Middy)
- [x] Extrair `X-Request-Id` do evento; gerar UUID v4 se ausente
- [x] Adicionar `requestId` ao contexto para uso nos handlers
- [x] Catch global de erros não tratados → `500 INTERNAL_ERROR` com `requestId`

### CORS

- [x] Responder `OPTIONS` com headers CORS corretos
- [x] CORS embutido em `baseHeaders()` — todas as respostas JSON e de erro
- [x] `Access-Control-Allow-Origin`: valor de `CLOUDFRONT_WEB_URL` (env var)
- [x] `Access-Control-Allow-Headers`: `Content-Type, Authorization`
- [x] Para teste local: aceitar `http://localhost:5173` se `NODE_ENV=development`

### Formato base URL

- [x] `{ApiBaseUrl}/{stage}/{path}` — ex.: `https://abc.execute-api.us-east-1.amazonaws.com/dev/products`
- [x] `ApiBaseUrl` sem stage e sem barra final (conforme infra task 10)

## Pré-requisitos

- Task 00 concluída (estrutura criada)

## Critérios de conclusão

- [x] `ok()`, `created()`, `apiError()` cobertos por testes unitários
- [x] Handler retorna `X-Request-Id` em todas as respostas
- [x] `api-routes.md` seção "Convenções globais" atualizada
- [x] Atualizar **Status** para `concluída`
