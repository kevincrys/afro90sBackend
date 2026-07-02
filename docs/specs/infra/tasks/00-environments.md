# Task 00 — Setup inicial do repositório e AWS

**Status:** concluída (MFA admin/root recomendado, não bloqueia CI/CD)  
**Arquivos alvo:** `[cdk.md](../cdk.md)`, `[overview.md](../overview.md)`

## Objetivo

Preparar o repositório `afro90sInfra` para desenvolvimento CDK e configurar os pré-requisitos **AWS (console/OIDC)** e **GitHub** antes do primeiro deploy via pipeline.

> **Sem AWS local:** OIDC, roles e Environments são configurados manualmente (console ou template CFN). CDK bootstrap roda na **primeira execução da pipeline** ([task 04](04-cicd.md)), não exige CLI local.

## Configurações já definidas


| Decisão             | Valor                                         |
| ------------------- | --------------------------------------------- |
| Conta AWS           | `083171867610` (única para dev e prod)        |
| Região              | `us-east-1`                                   |
| Contextos CDK       | `-c env=dev` e `-c env=prod`                  |
| Stages API GW       | `dev` e `prod`                                |
| Domínio customizado | base preparada, domínio a comprar futuramente |


## O que implementar

### Estrutura do repositório

- [x] Criar pasta `infra/` na raiz do repo
- [x] Dentro de `infra/`, rodar `cdk init app --language typescript`
- [x] Organizar pastas conforme `[cdk.md](../cdk.md)`:
  ```
  infra/
  ├── bin/app.ts
  ├── lib/
  │   ├── stacks/
  │   └── constructs/
  ├── test/
  ├── cdk.json
  ├── package.json
  └── tsconfig.json
  ```
- [x] Criar `.gitignore` com: `node_modules/`, `cdk.out/`, `.env`, `*.js.map` (dentro de `infra/`)
- [x] Criar `.env.example` na raiz de `infra/` com todas as chaves sem valores
- [x] Ajustar `tsconfig.json` para `strict: true` e `target: ES2020`
- [x] Adicionar scripts em `package.json` (`build`, `synth:dev/prod`, `diff`, `deploy`)

### IAM GitHub (CloudFormation)

- [x] Template `infra/iam/github-oidc-roles.template.yaml` (OIDC + 5 roles + policies JSON explícitas)
- [x] Runbook `infra/scripts/task-00-runbook.md`

### AWS — IAM e acesso (console)

- [x] Criar usuário IAM `kevincrys-admin` (não usar root no dia a dia)
  - Policy: `AdministratorAccess`
  - [ ] Ativar MFA no usuário *(recomendado; não bloqueia pipeline)*
- [ ] Ativar MFA na conta root *(recomendado)*
- [x] URL de login: `https://083171867610.signin.aws.amazon.com/console`

> **CLI local opcional:** `aws configure --profile kevincrys-admin` só é necessário se quiser rodar `cdk deploy` ou `cdk bootstrap` na máquina. O fluxo padrão do projeto é **pipeline + console**.

### AWS — OIDC provider e roles CI/CD

Setup **manual** (uma vez) — fundação para GitHub Actions assumirem role sem access key.

Referência alternativa: template `infra/iam/github-oidc-roles.template.yaml`

- [x] OIDC provider GitHub (`token.actions.githubusercontent.com`)
- [x] `afro90s-github-cdk-pr` — CFN read + diff + `sts:GetCallerIdentity`
- [x] `afro90s-github-cdk-dev` / `-prod` — `AdministratorAccess` (v1)
- [x] `afro90s-github-backend-dev` / `-prod` — S3 + Lambda (v1)

### GitHub — afro90sBackend Environments

- [x] **`dev`**: `AWS_ROLE_ARN`, `AWS_REGION`, `ARTIFACT_BUCKET`, `LAMBDA_FUNCTION_NAME`
- [x] **`production`**: idem com valores prod + required reviewers

### GitHub — Branches e Environments (afro90sInfra)

Conforme [github-pipeline-setup.md](../../../foundation/github-pipeline-setup.md) (seções 1, 4–6).

- [x] Branch `dev` criada no repositório `kevincrys/afro90sInfra`
- [x] Branch `main` protegida (PR + checks / ruleset)
- [x] **Settings → Environments → `dev`** (variables do runbook)
- [x] **Settings → Environments → `production`**
- [x] **Repository variables**: `AWS_REGION`, `AWS_ROLE_ARN_PR`

> **Próxima task:** [01 — Configuração por ambiente](01-cdk-config-deploy.md)

> **CDK bootstrap** (`CDKToolkit`) → [task 04 — CI/CD](04-cicd.md), na primeira execução dos workflows de deploy.

> **SES:** verificação de identidades → fase 4 ([task 18 — SES](18-ses.md)), não nesta task.

## Pré-requisitos

Nenhum — esta é a primeira task.

## Critérios de conclusão

- [x] `npm run build` sem erros dentro de `infra/`
- [x] `npm run synth:dev` gera CloudFormation *(local, sem credenciais AWS)*
- [x] Roles IAM CDK (3) + backend (2) criadas (OIDC GitHub)
- [x] Environments configurados no GitHub (afro90sInfra + afro90sBackend)
- [x] Atualizar **Status** para `concluída`

## Referências

- [Runbook](../../../../infra/scripts/task-00-runbook.md)
- [IAM template](../../../../infra/iam/github-oidc-roles.template.yaml)
- [github-pipeline-setup.md](../../../foundation/github-pipeline-setup.md)
- [Task 04 — bootstrap via pipeline](04-cicd.md)
