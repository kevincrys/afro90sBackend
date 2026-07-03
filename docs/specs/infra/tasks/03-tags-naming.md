# Task 03 — Tags e naming

**Status:** concluída  
**Arquivos alvo:** [`overview.md`](../overview.md), [`resources.md`](../resources.md)

## Objetivo

Implementar tags obrigatórias via CDK Aspect global e documentar a convenção de naming usada em todos os recursos.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Tags obrigatórias | `project=afro90s`, `env`, `managed-by=afro90sInfra` |
| Aplicação | CDK Aspect global no `app` |
| `env` em nomes físicos | `prod` (não `production`) |
| Limite de tamanho | Seguir limite padrão AWS por serviço |

## O que implementar

### Aspect de tags

- [x] Criar `lib/constructs/tagging-aspect.ts`
- [x] Aplicar em `bin/app.ts` com `Aspects.of(app).add(new TaggingAspect(config.env))`

### Convenção de naming

- [x] Padrão `afro90s-{env}-{tipo}-{nome}` documentado em `resources.md`
- [x] Helper `resourceName()` em `lib/constructs/naming.ts`
- [x] Tabela de nomes dev/prod em `resources.md`

## Pré-requisitos

- [Task 02](02-cdk-stacks.md) concluída

## Critérios de conclusão

- [x] Tags aplicadas via aspect global (`TaggingAspect` testado)
- [x] Convenção de naming documentada + helper `resourceName()`
- [x] `resources.md` com tabela de nomes atualizada
- [x] Atualizar **Status** para `concluída`

## Próxima task

[04 — CI/CD](04-cicd.md)
