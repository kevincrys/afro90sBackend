# Task 02 — Stacks CDK

**Status:** concluída  
**Arquivos alvo:** [`cdk.md`](../cdk.md)

## Objetivo

Criar a estrutura de stacks CDK em `infra/lib/stacks/` com dependências corretas e ponto de entrada único em `bin/app.ts`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Stacks | Uma por recurso (DB, Auth, Storage, API, Frontend) |
| Entry point | `bin/app.ts` instancia todas |
| Cross-stack | `Fn.importValue` (SSM Parameters) |
| Tags | Aspect CDK global na [task 03](03-tags-naming.md) |

## O que implementar

### `bin/app.ts`

- [x] Ler contexto `env` via `app.node.tryGetContext('env')`, falhar se ausente
- [x] Importar `getConfig` e passar config para cada stack
- [x] Passar `env: { account, region }` no `StackProps` de cada stack
- [x] Instanciar Database → Auth → Storage → Api → Frontend
- [x] `apiStack.addDependency` em database, auth e storage

### Stacks (scaffolds iniciais)

- [x] `lib/stacks/database-stack.ts`
- [x] `lib/stacks/auth-stack.ts`
- [x] `lib/stacks/storage-stack.ts`
- [x] `lib/stacks/api-stack.ts`
- [x] `lib/stacks/frontend-stack.ts`

### Nomes físicos das stacks

Padrão: `afro90s-{env}-stack-{nome}` — ver [`cdk.md`](../cdk.md).

## Pré-requisitos

- [Task 01](01-cdk-config-deploy.md) concluída

## Critérios de conclusão

- [x] `npm run synth:dev` gera 5 stacks sem erros
- [x] `npm run synth:prod` idem para prod
- [x] `cdk.md` atualizado com diagrama de dependências
- [x] Atualizar **Status** para `concluída`

## Próxima task

[03 — Tags e naming](03-tags-naming.md)
