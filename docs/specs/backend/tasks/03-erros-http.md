# Task 03 — Erros HTTP e ApiError

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), [`data-models.md`](../data-models.md)

## Objetivo

Implementar `ApiError` e helpers de resposta de erro padronizados usados por todas as rotas.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| `details` em `VALIDATION_ERROR` | Mapa campo → mensagem |
| Idioma das mensagens | Inglês na API |
| `500 INTERNAL_ERROR` | Inclui `requestId` no body |
| `NOT_FOUND` | Genérico com mensagem específica |
| Rate limit | Somente no API Gateway (fora do código) |

## O que implementar

### `libs/models/errors.ts` (`@afro90s/models`)

```typescript
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_CURSOR'
  | 'INVALID_STATUS_TRANSITION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string>;
  requestId?: string;
}
```

### Mapeamento `code` → HTTP status

| Code | Status |
|------|--------|
| `VALIDATION_ERROR` | 400 |
| `INVALID_CURSOR` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `INSUFFICIENT_STOCK` | 409 |
| `INVALID_STATUS_TRANSITION` | 409 |
| `INTERNAL_ERROR` | 500 |

- [ ] Implementar `libs/http/errors.ts` com `throwValidationError(fields)`, `throwNotFound(msg)`, etc.
- [ ] Middleware Middy ou wrapper que converte `ApiError` lançado em resposta HTTP correta
- [ ] `ZodError` → `VALIDATION_ERROR` com `details` mapeado

### Testes

- [ ] `VALIDATION_ERROR` retorna 400 com `details`
- [ ] `NOT_FOUND` retorna 404
- [ ] Erro não tratado retorna 500 com `requestId`

## Pré-requisitos

- Task 00, 01 concluídas

## Critérios de conclusão

- [ ] Todos os códigos de erro cobertos por testes unitários
- [ ] `api-routes.md` seção de erros atualizada com exemplos JSON
- [ ] Atualizar **Status** para `concluída`
