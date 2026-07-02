# Task 03 — Tags e naming

**Status:** pendente  
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

- [ ] Criar `lib/constructs/tagging-aspect.ts`:

```typescript
import { IAspect, Tags } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

export class TaggingAspect implements IAspect {
  constructor(private readonly env: string) {}
  visit(node: IConstruct): void {
    Tags.of(node).add('project', 'afro90s');
    Tags.of(node).add('env', this.env);
    Tags.of(node).add('managed-by', 'afro90sInfra');
  }
}
```

- [ ] Aplicar em `bin/app.ts`:

```typescript
import { Aspects } from 'aws-cdk-lib';
Aspects.of(app).add(new TaggingAspect(env));
```

### Convenção de naming

Padrão: `afro90s-{env}-{tipo}-{nome}`

| Tipo | Abreviação |
|------|------------|
| S3 bucket | `s3` |
| CloudFront | `cf` |
| DynamoDB | `ddb` |
| Lambda | `lambda` |
| API Gateway | `apigw` |
| Cognito | `cognito` |
| IAM Role | `role` |
| SSM Parameter | path `/afro90s/{env}/...` |
| Stack | `stack` |

### Tabela de recursos com nomes

- [ ] Documentar em `resources.md` a tabela de nomes para dev e prod:

| Recurso | Nome dev | Nome prod |
|---------|----------|-----------|
| S3 web | `afro90s-dev-s3-web` | `afro90s-prod-s3-web` |
| S3 assets | `afro90s-dev-s3-assets` | `afro90s-prod-s3-assets` |
| DynamoDB products | `afro90s-dev-ddb-products` | `afro90s-prod-ddb-products` |
| DynamoDB orders | `afro90s-dev-ddb-orders` | `afro90s-prod-ddb-orders` |
| Cognito | `afro90s-dev-cognito-admins` | `afro90s-prod-cognito-admins` |
| Lambda API | `afro90s-dev-lambda-api` | `afro90s-prod-lambda-api` |
| API Gateway | `afro90s-dev-apigw-api` | `afro90s-prod-apigw-api` |

## Pré-requisitos

- [Task 02](02-cdk-stacks.md) concluída (stacks criadas)

## Critérios de conclusão

- [ ] Todos os recursos gerados no `cdk synth` têm as 3 tags
- [ ] Nenhum recurso com nome físico diferente do padrão `afro90s-{env}-{tipo}-{nome}`
- [ ] `resources.md` com tabela de nomes atualizada
- [ ] Atualizar **Status** para `concluída`
