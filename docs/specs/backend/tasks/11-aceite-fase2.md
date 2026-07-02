# Task 11 — Aceite Fase 2 (Auth)

**Fase:** 2 — Login admin  
**Status:** pendente

## Objetivo

Validar que a autenticação Cognito está integrada — rotas admin ainda não implementadas, mas o token é aceito.

## Checklist de aceite

- [ ] Token Cognito válido (grupo `admins`) não recebe `401` do API Gateway
- [ ] Token ausente em rota admin → `401`
- [ ] Token expirado → `401`
- [ ] Rotas públicas da fase 1 continuam funcionando (regressão)
- [ ] `npm run test:coverage` mantém ≥ 80%

## Pré-requisitos

- Task 10 concluída
- Infra task 14 (aceite fase 2) concluída

## Critérios de conclusão

- [ ] Checklist completo
- [ ] Atualizar **Status** para `concluída` — **fase 2 entregue**
