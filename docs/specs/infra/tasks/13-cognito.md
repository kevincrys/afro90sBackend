# Task 13 — Cognito (login admin)

**Fase:** 2 — Login admin  
**Status:** pendente  
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

- [ ] Nome: `afro90s-{env}-cognito-admins`
- [ ] `selfSignUpEnabled: false`
- [ ] `mfa: Mfa.OFF`
- [ ] Política de senha padrão CDK
- [ ] `removalPolicy: DESTROY` dev / `RETAIN` prod

### Grupo e App Client

- [ ] `CfnUserPoolGroup` com nome `admins`
- [ ] `UserPoolClient`:
  - `generateSecret: false`
  - `authFlows: { userSrp: true }`
  - `preventUserExistenceErrors: true`

### Authorizer JWT no HTTP API

- [ ] Criar `HttpJwtAuthorizer` na `ApiStack` (lê User Pool ID via SSM):
  ```typescript
  new HttpJwtAuthorizer('CognitoAuthorizer', issuerUrl, {
    jwtAudience: [cognitoClientId],
  })
  ```
- [ ] O authorizer é criado mas **não aplicado em nenhuma rota ainda** (fase 3 aplica)

### Exports via SSM

- [ ] `/afro90s/{env}/cognito-user-pool-id`
- [ ] `/afro90s/{env}/cognito-client-id`
- [ ] `/afro90s/{env}/cognito-region` = `us-east-1`

### Outputs CloudFormation

- [ ] `CfnOutput` `CognitoUserPoolId`
- [ ] `CfnOutput` `CognitoClientId`
- [ ] `CfnOutput` `CognitoRegion`

### Pós-deploy — criar usuário admin (manual)

```
1. Console AWS → Cognito → User pools → afro90s-{env}-cognito-admins
2. Users → Create user → preencher e-mail e senha temporária
3. Groups → Adicionar usuário ao grupo "admins"
```

## Pré-requisitos

- [Task 12](12-aceite-fase1.md) concluída (fase 1 entregue)

## Critérios de conclusão

- [ ] User Pool criado no CloudFormation
- [ ] App client sem secret, SRP habilitado
- [ ] Grupo `admins` existente
- [ ] Usuário admin criado manualmente e adicionado ao grupo `admins`
- [ ] Login funcional via Amplify/Cognito JS SDK no frontend admin (ou Postman)
- [ ] Outputs `CognitoUserPoolId`, `CognitoClientId`, `CognitoRegion` no CloudFormation
- [ ] `resources.md` e `outputs.md` atualizados
- [ ] Atualizar **Status** para `concluída`
