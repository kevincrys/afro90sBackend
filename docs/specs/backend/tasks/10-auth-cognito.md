# Task 10 — Autenticação Cognito (middleware admin)

**Fase:** 2 — Login admin  
**Status:** concluída  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), [ADR-005](../../../foundation/adr/005-admin-auth-v1.md), `libs/http/`, `resources/*-admin/`

## Objetivo

Implementar middleware de autenticação para rotas `/admin/*`. O authorizer JWT no API Gateway valida o token; o middleware verifica claims adicionais se necessário.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Token | `access_token` no header `Authorization: Bearer` |
| Validação primária | API Gateway authorizer (automático) |
| Grupo obrigatório | `admins` |
| Claims usados | `sub`, `cognito:groups` |
| `401` vs `403` | Sempre `401` (sem token ou inválido) |
| Refresh token | Frontend (1h refresh, access token diário) |

## O que implementar

### `libs/http/src/auth.ts`

- [x] Extrair claims do `event.requestContext.authorizer.jwt.claims`
- [x] Verificar presença de `cognito:groups` contendo `admins`
- [x] Sem grupo `admins` → `401 UNAUTHORIZED`
- [x] Exportar `adminUserId` (claim `sub`) via `createAdminHandler`

### Router

- [x] Handlers admin (`products-admin`, `orders-admin`) usam `createAdminHandler`
- [x] Rotas públicas continuam com `createHandler` (sem auth)

### Documentação em `api-routes.md`

- [x] Bloco reutilizável de header `Authorization` para rotas admin
- [x] Exemplos JSON de `401`

## Pré-requisitos

- Fase 1 entregue (task 09)
- Infra fase 2 (Cognito) deployada

## Critérios de conclusão

- [x] Rota admin stub com token válido → não retorna `401`
- [x] Rota admin sem claims → `401` (middleware; sem token → API Gateway)
- [x] Middleware testado com claims mock
- [x] Atualizar **Status** para `concluída`
