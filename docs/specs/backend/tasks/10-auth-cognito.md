# Task 10 — Autenticação Cognito (middleware admin)

**Fase:** 2 — Login admin  
**Status:** pendente  
**Arquivos alvo:** [`api-routes.md`](../api-routes.md), [ADR-005](../../../foundation/adr/005-admin-auth-v1.md)

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

### `src/middleware/auth.ts`

- [ ] Extrair claims do `event.requestContext.authorizer.jwt.claims`
- [ ] Verificar presença de `cognito:groups` contendo `admins`
- [ ] Sem grupo `admins` → `401 UNAUTHORIZED`
- [ ] Exportar `adminUserId` (claim `sub`) para handlers

### Router

- [ ] Registrar rotas `/admin/*` com flag `requiresAuth: true`
- [ ] Rotas públicas sem middleware de auth

### Documentação em `api-routes.md`

- [ ] Bloco reutilizável de header `Authorization` para rotas admin
- [ ] Exemplos JSON de `401`

## Pré-requisitos

- Fase 1 entregue (task 09)
- Infra fase 2 (Cognito) deployada

## Critérios de conclusão

- [ ] Rota admin stub com token válido → não retorna `401`
- [ ] Rota admin sem token → `401` (via API Gateway)
- [ ] Middleware testado com claims mock
- [ ] Atualizar **Status** para `concluída`
