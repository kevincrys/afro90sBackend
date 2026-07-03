# Task 01 — Configuração por ambiente

**Status:** concluída  
**Arquivos alvo:** [`cdk.md`](../cdk.md)

## Objetivo

Criar os arquivos de configuração por ambiente (`dev` e `prod`) e a interface TypeScript que todos os stacks consomem.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Arquivos | `lib/config/dev.ts` + `lib/config/prod.ts` |
| Parâmetros externos | `domainName`, `adminEmail` e qualquer valor não obtido via `importValue` |
| Deploy no CI | Stack a stack (com opção `--all`) |
| Destroy | Permitido em qualquer ambiente |

## O que implementar

### Interface de configuração

- [x] Criar `lib/config/types.ts` com interface `AppConfig`

### Arquivos de config

- [x] Criar `lib/config/dev.ts`
- [x] Criar `lib/config/prod.ts`
- [x] Criar `lib/config/index.ts` com `getConfig(env)`

### Uso em `bin/app.ts`

- [x] `getConfig` usado para `account` / `region` no `StackProps`
- [x] Passar `config` completo para stacks via `Afro90sStackProps`

### Scripts npm validados

- [x] `npm run build` — compila TypeScript sem erros
- [x] `npm run synth:dev` — gera CloudFormation dev
- [x] `npm run synth:prod` — gera CloudFormation prod
- [x] `npm run diff:dev` — script disponível (requer credenciais AWS)
- [x] `npm run deploy:dev` — script disponível

## Pré-requisitos

- [Task 00](00-environments.md) concluída (estrutura do repo criada)

## Critérios de conclusão

- [x] `getConfig('dev')` e `getConfig('prod')` retornam configs sem erro
- [x] `app.ts` usa config para conta/região (stacks completos na task 02)
- [x] `npm run build` sem erros TypeScript
- [x] `cdk.md` atualizado com tabela de parâmetros por env
- [x] Atualizar **Status** para `concluída`

## Próxima task

[02 — Stacks CDK](02-cdk-stacks.md)
