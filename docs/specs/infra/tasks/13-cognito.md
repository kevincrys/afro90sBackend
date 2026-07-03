# Task 13 — Cognito (login admin)

**Fase:** 2 — Login admin  
**Status:** concluída (código; usuário admin manual pós-deploy)  
**Arquivos alvo:** [`resources.md`](../resources.md), [`outputs.md`](../outputs.md)

## Objetivo

Implementar `AuthStack` com o User Pool Cognito e configurar o authorizer JWT no HTTP API. Após esta fase o login de admin é possível — mas as rotas `/admin/*` só existem na fase 3.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Self sign-up | Desativado |
| MFA | Não (fora de escopo v1) |
| App client | Sem secret (SPA), fluxo SRP |
| Criação de admins | Console AWS manualmente |
| Grupo | `admins` (único) |
| Hosted UI | Não necessário na v1 |

## O que implementar

### User Pool

- [x] Nome: `afro90s-{env}-cognito-admins`
- [x] `selfSignUpEnabled: false`
- [x] `mfa: Mfa.OFF`
- [x] Política de senha padrão CDK
- [x] `removalPolicy: DESTROY` dev / `RETAIN` prod

### Grupo e App Client

- [x] `CfnUserPoolGroup` com nome `admins`
- [x] `UserPoolClient`:
  - `generateSecret: false`
  - `authFlows: { userSrp: true }`
  - `preventUserExistenceErrors: true`

### Authorizer JWT no HTTP API

- [x] `HttpJwtAuthorizer` na `ApiStack` (issuer + audience via SSM `/afro90s/{env}/cognito-*`)
- [x] Propriedade `cognitoAuthorizer` exposta — **não aplicado em rotas** (task 16)

### Exports via SSM

- [x] `/afro90s/{env}/cognito-user-pool-id`
- [x] `/afro90s/{env}/cognito-client-id`
- [x] `/afro90s/{env}/cognito-region` = `us-east-1`

### Outputs CloudFormation

- [x] `CfnOutput` `CognitoUserPoolId`
- [x] `CfnOutput` `CognitoClientId`
- [x] `CfnOutput` `CognitoRegion`

### Pós-deploy — criar usuário admin (manual)

```
1. Console AWS → Cognito → User pools → afro90s-{env}-cognito-admins
2. Users → Create user → preencher e-mail e senha temporária
3. Groups → Adicionar usuário ao grupo "admins"
```

## Pré-requisitos

- [Task 12](12-aceite-fase1.md) concluída (fase 1 entregue)

## Critérios de conclusão

- [x] User Pool criado no CloudFormation (`AuthStack`)
- [x] App client sem secret, SRP habilitado
- [x] Grupo `admins` existente
- [ ] Usuário admin criado manualmente e adicionado ao grupo `admins`
- [ ] Login funcional via Amplify/Cognito JS SDK no frontend admin (ou Postman)
- [x] Outputs `CognitoUserPoolId`, `CognitoClientId`, `CognitoRegion` no CloudFormation
- [x] `resources.md` e `outputs.md` atualizados
- [x] **Status** código: concluída — aceite manual fase 2 (task 14)
