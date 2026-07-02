# Task 01 — Stacks CDK

**Status:** pendente  
**Arquivos alvo:** [`cdk.md`](../cdk.md)

## Objetivo

Criar a estrutura de stacks CDK em `infra/lib/stacks/` com dependências corretas e ponto de entrada único em `bin/app.ts`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Stacks | Uma por recurso (DB, Auth, Storage, API, Frontend) |
| Entry point | `bin/app.ts` instancia todas |
| Cross-stack | `Fn.importValue` (SSM Parameters) |
| Tags | Aspect CDK global (ver task 03) |

## O que implementar

### `bin/app.ts`

- [ ] Ler contexto `env` via `app.node.tryGetContext('env')`, falhar se ausente
- [ ] Instanciar as stacks na ordem:
  1. `DatabaseStack` (`lib/stacks/database-stack.ts`)
  2. `AuthStack` (`lib/stacks/auth-stack.ts`)
  3. `StorageStack` (`lib/stacks/storage-stack.ts`)
  4. `ApiStack` (`lib/stacks/api-stack.ts`)
  5. `FrontendStack` (`lib/stacks/frontend-stack.ts`)
- [ ] Declarar dependências explícitas via `apiStack.addDependency(databaseStack)` etc.
- [ ] Aplicar Tags aspect global sobre o `app`

### Stacks (scaffolds iniciais)

Criar cada arquivo com classe vazia + tags obrigatórias. Implementação dos recursos fica nas tasks 04–09.

- [ ] `lib/stacks/database-stack.ts` — DynamoDB
- [ ] `lib/stacks/auth-stack.ts` — Cognito
- [ ] `lib/stacks/storage-stack.ts` — S3 assets
- [ ] `lib/stacks/api-stack.ts` — API Gateway + Lambda
- [ ] `lib/stacks/frontend-stack.ts` — S3 web + CloudFront

### Nomes físicos das stacks

Padrão: `afro90s-{env}-stack-{nome}`

| Stack | Nome (exemplo dev) |
|-------|--------------------|
| DatabaseStack | `afro90s-dev-stack-database` |
| AuthStack | `afro90s-dev-stack-auth` |
| StorageStack | `afro90s-dev-stack-storage` |
| ApiStack | `afro90s-dev-stack-api` |
| FrontendStack | `afro90s-dev-stack-frontend` |

### Diagrama de dependências

```
DatabaseStack ──┬──► ApiStack
AuthStack      ──┤
StorageStack   ──┘
FrontendStack (independente — CORS origin definida via SSM)
```

### Constructs reutilizáveis (se houver oportunidade)

- [ ] Extrair construct `TaggedConstruct` base se repetição aparecer
- [ ] Manter em `lib/constructs/` — criar apenas se dois ou mais stacks repetirem o mesmo padrão

## Pré-requisitos

- Task 00 concluída (repo e CDK bootstrap)
- Task 02 concluída (config por env disponível)

## Critérios de conclusão

- [ ] `npm run synth:dev` gera 5 stacks sem erros
- [ ] `npm run synth:prod` idem para prod
- [ ] Todas as stacks têm as 3 tags obrigatórias no template CloudFormation gerado
- [ ] `cdk.md` atualizado com diagrama de dependências
- [ ] Atualizar **Status** para `concluída`
