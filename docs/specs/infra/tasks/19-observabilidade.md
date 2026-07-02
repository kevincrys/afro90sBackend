# Task 19 — Observabilidade

**Fase:** 4 — Email (pode ser implementada em paralelo)  
**Status:** pendente  
**Arquivos alvo:** [`resources.md`](../resources.md), [`overview.md`](../overview.md)

## Objetivo

Configurar log groups com retenção e dashboard CloudWatch dentro do free tier.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Retenção de logs | 14 dias (dev e prod) |
| Log level | `INFO` em todos os ambientes |
| Métricas | Defaults AWS/Lambda (sem customizadas) |
| Alarmes | Sem alarmes na v1 |
| X-Ray | Fora de escopo v1 |
| Dashboard | Um por ambiente, dentro do free tier gratuito |

## O que implementar

### Log Groups

- [ ] Criar `LogGroup` explícito para cada Lambda:
  - `/aws/lambda/afro90s-{env}-lambda-api`
  - `/aws/lambda/afro90s-{env}-lambda-admin` (se Lambda separada na fase 3)
  - `retention: RetentionDays.TWO_WEEKS`
  - `removalPolicy: DESTROY` em dev
- [ ] Verificar que nenhum `LogGroup` tem retenção `INFINITE` (geraria custo)

### Dashboard CloudWatch

- [ ] Criar `Dashboard` com nome `afro90s-{env}-dashboard`:
  - Widget: Lambda Invocations
  - Widget: Lambda Errors
  - Widget: Lambda Duration P50/P99
  - Widget: API Gateway 4xx / 5xx
- [ ] Usar apenas métricas nativas (gratuitas)

> Free tier: 3 dashboards com até 50 métricas — dentro do limite.

### Sem alarmes

- [ ] Confirmar que não há `Alarm` ou `CfnAlarm` nos stacks

## Pré-requisitos

- Task 10 (Lambda criada — para referenciar o log group)

## Critérios de conclusão

- [ ] Log groups com retenção 14 dias visíveis no CloudWatch
- [ ] Dashboard `afro90s-dev-dashboard` com os 4 widgets funcionando
- [ ] Nenhum alarme CloudWatch criado (custo zero)
- [ ] `resources.md` atualizado com seção observabilidade
- [ ] Atualizar **Status** para `concluída`
