# Task 03 — Erros HTTP e ApiError

**Fase:** 0 — Fundação  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), [`data-models.md`](../data-models.md), `libs/models/`, `libs/http/`

## Objetivo

Implementar `ApiError` e helpers de resposta de erro padronizados usados por todas as rotas.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| `details` em `VALIDATION_ERROR` | Mapa campo → mensagem |
| Idioma das mensagens HTTP | **pt-BR** (`ApiError.message`); códigos em inglês (task 01) |
| `500 INTERNAL_ERROR` | Inclui `requestId` no body |
| `NOT_FOUND` | Genérico com mensagem específica |
| Rate limit | Somente no API Gateway (fora do código) |
| `403` na API | **Não usar na v1** — auth sempre `401`; `403` no CloudFront é redirect SPA (task 10) |

## O que implementar

### `libs/models/src/errors.ts`

- [x] `ApiErrorCode`, `ApiError` class, `API_ERROR_STATUS`
- [x] `isApiError()` type guard

### `libs/http/src/errors.ts`

- [x] `throwValidationError()`, `throwNotFound()`, `throwUnauthorized()`, `throwForbidden()`, etc.
- [x] `toErrorResponse()`, `zodErrorToDetails()`, `parseOrThrow()`
- [x] `createHandler()` converte `ApiError` e `ZodError` em resposta HTTP

### Mapeamento `code` → HTTP status

| Code | Status |
|------|--------|
| `VALIDATION_ERROR` | 400 |
| `INVALID_CURSOR` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 *(tipo reservado — rotas v1 não emitem)* |
| `NOT_FOUND` | 404 |
| `INSUFFICIENT_STOCK` | 409 |
| `INVALID_STATUS_TRANSITION` | 409 |
| `INTERNAL_ERROR` | 500 |

### Testes

- [x] `VALIDATION_ERROR` retorna 400 com `details`
- [x] `NOT_FOUND` retorna 404
- [x] Erro não tratado retorna 500 com `requestId`
- [x] Todos os códigos de erro cobertos por testes unitários

## Pré-requisitos

- Task 00, 01 concluídas

## Critérios de conclusão

- [x] Todos os códigos de erro cobertos por testes unitários
- [x] `api-routes.md` seção de erros atualizada com exemplos JSON
- [x] Atualizar **Status** para `concluída`
