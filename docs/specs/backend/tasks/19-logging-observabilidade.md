# Task 19 — Lib de logging e observabilidade

**Fase:** Transversal — Observabilidade  
**Status:** concluída  
**Arquivos alvo:** `libs/logger/`, `libs/http/`, `libs/models/`

## Objetivo

Centralizar logs estruturados com interface `Logger`, filtro por `LOG_LEVEL` e `sessionId` compartilhado por requisição (alias do `requestId`).

## Ordem recomendada

Implementar **antes** da Task 16 (SES): `19 → 16 → 17 → 18`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Pacote | `@afro90s/logger` em `libs/logger/` |
| Session ID | Igual ao `requestId` (`X-Request-Id` / `resolveRequestId`) |
| Propagação | `AsyncLocalStorage` via `runWithSession` |
| Formato | JSON em uma linha (CloudWatch) |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` — **env da Lambda**; sobrescreve o default |
| Default (sem `LOG_LEVEL`) | `debug` se `NODE_ENV=development`; senão `error` (prod/Lambda) |
| PII em context | Não logar tokens, body, dados de cliente |

## O que implementar

### `libs/logger/`

- [x] Interface `Logger` (`debug`, `info`, `warn`, `error`, `child`)
- [x] `ConsoleLogger` — saída JSON com `level`, `message`, `timestamp`, `sessionId?`
- [x] `runWithSession(sessionId, fn)` / `getSessionId()`
- [x] `getLogger()` / `createLogger(bindings?)`
- [x] `resolveLogLevel()` a partir de `LOG_LEVEL` / `NODE_ENV`

### Integração

- [x] `createHandler` envolve execução em `runWithSession(requestId, ...)`
- [x] `logApiError` usa `getLogger().error` (sem `console.*`)
- [x] Unhandled errors no handler usam `getLogger().error`
- [x] `email.service.ts` usa `logger.info` (stub pré-SES)

### Testes

- [x] Filtragem por `LOG_LEVEL`
- [x] `sessionId` propagado em `runWithSession`
- [x] `child()` merge de bindings
- [x] `npm run test:coverage` ≥ 80%

## Pré-requisitos

- Tasks 01–03 (http + erros)

## Critérios de conclusão

- [x] Lib `@afro90s/logger` funcional
- [x] Logs migrados nos pontos centralizados (handler, `logApiError`, email stub)
- [x] Task 16 pode usar logger para SES
- [x] Atualizar **Status** para `concluída`
