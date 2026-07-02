# Task 14 — Aceite Fase 2 (Login admin)

**Fase:** 2 — Login admin  
**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar que o login de admin via Cognito está funcional. As rotas `/admin/*` ainda não existem — o token apenas deve ser emitido e aceito pelo authorizer.

## Checklist de aceite

- [ ] `cdk deploy --all -c env=dev` sem erros após adicionar `AuthStack`
- [ ] User Pool `afro90s-dev-cognito-admins` visível no console Cognito
- [ ] Usuário admin criado e adicionado ao grupo `admins`
- [ ] Login funcional: obter token de acesso via Cognito (Postman ou frontend)
- [ ] Token JWT decodificado contém `cognito:groups: ["admins"]`
- [ ] `GET /admin/products` com token válido retorna `404` ou `501` (rota ainda não existe, mas **não** `401`)
  - Confirmar que o authorizer aceita o token (não rejeita com `401`)
- [ ] Rotas públicas da fase 1 continuam funcionando (regressão)
- [ ] Outputs `CognitoUserPoolId` e `CognitoClientId` disponíveis no CloudFormation

## Pré-requisitos

- [Task 13](13-cognito.md) concluída

## Critérios de conclusão

- [ ] Todos os itens do checklist marcados
- [ ] `overview.md` atualizado com status da fase 2
- [ ] Atualizar **Status** para `concluída` — **fase 2 entregue**
