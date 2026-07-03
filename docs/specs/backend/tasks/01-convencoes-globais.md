# Task 01 — Convenções globais da API

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar convenções transversais em `src/utils/response.ts` e documentar contratos HTTP base que todas as rotas seguem.

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

### `src/utils/response.ts`

- [ ] Função `ok(body)` → `{ statusCode: 200, headers, body: JSON.stringify(body) }`
- [ ] Função `created(body)` → `{ statusCode: 201, ... }`
- [ ] Função `noContent()` → `{ statusCode: 204, headers, body: '' }`
- [ ] Função `error(statusCode, code, message, details?)` → corpo `ApiError`
- [ ] Headers obrigatórios em todas as respostas:
  ```typescript
  {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Request-Id': requestId,
  }
  ```

### `src/handler.ts` — entry point com Middy

- [ ] Middleware Middy: `httpRouterHandler` ou roteamento manual
- [ ] Extrair `X-Request-Id` do evento; gerar UUID v4 se ausente
- [ ] Adicionar `requestId` ao contexto para uso nos handlers
- [ ] Catch global de erros não tratados → `500 INTERNAL_ERROR` com `requestId`

### CORS

- [ ] Responder `OPTIONS` com headers CORS corretos
- [ ] `Access-Control-Allow-Origin`: valor de `CLOUDFRONT_WEB_URL` (env var)
- [ ] `Access-Control-Allow-Headers`: `Content-Type, Authorization`
- [ ] Para teste local: aceitar `http://localhost:5173` se `NODE_ENV=development`

### Formato base URL

- [ ] `{ApiBaseUrl}/{stage}/{path}` — ex.: `https://abc.execute-api.us-east-1.amazonaws.com/dev/products`
- [ ] `ApiBaseUrl` sem stage e sem barra final (conforme infra task 10)

## Pré-requisitos

- Task 00 concluída (estrutura criada)

## Critérios de conclusão

- [ ] `ok()`, `created()`, `error()` cobertos por testes unitários
- [ ] Handler retorna `X-Request-Id` em todas as respostas
- [ ] `api-routes.md` seção "Convenções globais" atualizada
- [ ] Atualizar **Status** para `concluída`
