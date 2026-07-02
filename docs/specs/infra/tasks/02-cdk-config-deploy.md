# Task 02 — Configuração por ambiente

**Status:** pendente  
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

- [ ] Criar `lib/config/types.ts` com interface `AppConfig`:

```typescript
export interface AppConfig {
  env: 'dev' | 'prod';
  region: string;
  account: string;
  domainName?: string;   // placeholder, domínio a comprar
  adminEmail: string;    // e-mail admin para SES
}
```

### Arquivos de config

- [ ] Criar `lib/config/dev.ts`:

```typescript
import { AppConfig } from './types';
export const devConfig: AppConfig = {
  env: 'dev',
  region: 'us-east-1',
  account: '083171867610',
  adminEmail: '',        // preencher com e-mail real
};
```

- [ ] Criar `lib/config/prod.ts` com mesma estrutura, `env: 'prod'`
- [ ] Criar `lib/config/index.ts` que exporta config pelo env:

```typescript
import { devConfig } from './dev';
import { prodConfig } from './prod';
export function getConfig(env: string) {
  if (env === 'dev') return devConfig;
  if (env === 'prod') return prodConfig;
  throw new Error(`env inválido: ${env}`);
}
```

### Uso em `bin/app.ts`

- [ ] Importar `getConfig` e passar para cada stack via construtor
- [ ] Passar `env: { account, region }` no `StackProps` de cada stack

### Scripts npm validados

- [ ] `npm run build` — compila TypeScript sem erros
- [ ] `npm run synth:dev` — gera CloudFormation dev
- [ ] `npm run synth:prod` — gera CloudFormation prod
- [ ] `npm run diff:dev` — compara com estado AWS dev
- [ ] `npm run deploy:dev` — deploya todas as stacks dev

## Pré-requisitos

- Task 00 concluída (estrutura do repo criada)

## Critérios de conclusão

- [ ] `getConfig('dev')` e `getConfig('prod')` retornam configs sem erro
- [ ] Todos os stacks recebem config via props (sem hardcode de conta/região)
- [ ] `npm run build` sem erros TypeScript
- [ ] `cdk.md` atualizado com tabela de parâmetros por env
- [ ] Atualizar **Status** para `concluída`
