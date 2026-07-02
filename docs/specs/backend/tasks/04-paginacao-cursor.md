# Task 04 — Paginação por cursor

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md)

## Objetivo

Implementar utilitário de cursor opaco Base64URL para listagens paginadas.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Formato cursor | Base64URL de JSON interno |
| `limit` default | 20 |
| `limit` máximo | 50 |
| Cursor inválido | `400 INVALID_CURSOR` |

## O que implementar

### `src/utils/pagination.ts`

```typescript
interface CursorPayload {
  lastEvaluatedKey: Record<string, unknown>;
  filters?: { name?: string; category?: string; status?: string };
}

export function encodeCursor(payload: CursorPayload): string;
export function decodeCursor(cursor: string): CursorPayload; // lança INVALID_CURSOR se inválido
export function parseLimit(raw?: string): number; // default 20, max 50
```

- [ ] `encodeCursor` / `decodeCursor` com Base64URL
- [ ] Validar que cursor decodificado tem estrutura esperada
- [ ] `parseLimit`: retorna 20 se ausente; clamp em 50

### Resposta padrão de listagem

```typescript
interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}
```

- [ ] Helper `paginated(items, lastKey, filters?)` que retorna `nextCursor` ou `null`

### Testes

- [ ] Round-trip encode/decode
- [ ] Cursor corrompido → `INVALID_CURSOR`
- [ ] `limit=100` → clamped para 50

## Pré-requisitos

- Task 03 concluída (para `INVALID_CURSOR`)

## Critérios de conclusão

- [ ] Utilitário coberto por testes unitários
- [ ] `api-routes.md` documenta formato de `cursor` e `limit`
- [ ] Atualizar **Status** para `concluída`
