# Task 00 — Setup inicial do repositório e AWS

**Status:** pendente  
**Arquivos alvo:** [`cdk.md`](../cdk.md), [`overview.md`](../overview.md)

## Objetivo

Preparar o repositório `afro90sInfra` para desenvolvimento CDK e configurar todos os pré-requisitos AWS e GitHub antes do primeiro `cdk deploy`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Conta AWS | `083171867610` (única para dev e prod) |
| Região | `us-east-1` |
| Contextos CDK | `-c env=dev` e `-c env=prod` |
| Stages API GW | `dev` e `prod` |
| Domínio customizado | base preparada, domínio a comprar futuramente |

## O que implementar

### Estrutura do repositório

- [ ] Criar pasta `infra/` na raiz do repo
- [ ] Dentro de `infra/`, rodar `cdk init app --language typescript`
- [ ] Organizar pastas conforme [`cdk.md`](../cdk.md):
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
- [ ] Criar `.gitignore` com: `node_modules/`, `cdk.out/`, `.env`, `*.js.map` (dentro de `infra/`)
- [ ] Criar `.env.example` na raiz de `infra/` com todas as chaves sem valores:
  ```
  AWS_PROFILE=
  CDK_DEFAULT_ACCOUNT=083171867610
  CDK_DEFAULT_REGION=us-east-1
  ```
- [ ] Ajustar `tsconfig.json` para `strict: true` e `target: ES2020`
- [ ] Adicionar scripts em `package.json`:
  ```json
  "build": "tsc",
  "synth:dev": "cdk synth -c env=dev",
  "synth:prod": "cdk synth -c env=prod",
  "diff:dev": "cdk diff -c env=dev",
  "diff:prod": "cdk diff -c env=prod",
  "deploy:dev": "cdk deploy --all -c env=dev",
  "deploy:prod": "cdk deploy --all -c env=prod"
  ```

### AWS — IAM e acesso

- [ ] Criar usuário IAM `kevincrys-admin` (não usar root no dia a dia)
  - Policy: `AdministratorAccess`
  - Ativar MFA
- [ ] Ativar MFA na conta root
- [ ] Salvar URL de login: `https://083171867610.signin.aws.amazon.com/console`
- [ ] Criar access key para uso local via `aws configure --profile kevincrys-admin`

### AWS — CDK Bootstrap

- [ ] Com o perfil configurado, rodar uma vez:
  ```bash
  cd infra
  npm ci
  npx cdk bootstrap aws://083171867610/us-east-1
  ```
- [ ] Confirmar stack `CDKToolkit` no CloudFormation (`us-east-1`)

### AWS — OIDC provider para GitHub Actions

No console: **IAM → Identity providers → Add provider**

- [ ] Type: `OpenID Connect`
- [ ] URL: `https://token.actions.githubusercontent.com`
- [ ] Audience: `sts.amazonaws.com`

### AWS — Roles IAM para CI/CD

Criar 3 roles com os trust policies abaixo:

**`afro90s-github-cdk-pr`** (PRs — só synth/diff):
```json
{
  "Condition": {
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:kevincrys/afro90sInfra:pull_request"
    }
  }
}
```

**`afro90s-github-cdk-dev`** (deploy dev):
```json
{
  "Condition": {
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:kevincrys/afro90sInfra:ref:refs/heads/dev"
    }
  }
}
```

**`afro90s-github-cdk-prod`** (deploy prod):
```json
{
  "Condition": {
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:kevincrys/afro90sInfra:ref:refs/heads/main"
    }
  }
}
```

- [ ] `afro90s-github-cdk-pr` → policy: CloudFormation read + `sts:GetCallerIdentity`
- [ ] `afro90s-github-cdk-dev` → policy: `AdministratorAccess` (restringir depois da v1)
- [ ] `afro90s-github-cdk-prod` → policy: `AdministratorAccess` (restringir depois da v1)

### GitHub — Branches e Environments

- [ ] Branch `dev` criada no repositório `kevincrys/afro90sInfra`
- [ ] Branch `main` criada e protegida (exigir PR + checks)
- [ ] **Settings → Environments → `dev`**:
  - Variable `AWS_ROLE_ARN` = `arn:aws:iam::083171867610:role/afro90s-github-cdk-dev`
  - Variable `CDK_ENV` = `dev`
- [ ] **Settings → Environments → `production`**:
  - Variable `AWS_ROLE_ARN` = `arn:aws:iam::083171867610:role/afro90s-github-cdk-prod`
  - Variable `CDK_ENV` = `prod`
- [ ] **Repository variables**:
  - `AWS_REGION` = `us-east-1`
  - `AWS_ROLE_ARN_PR` = `arn:aws:iam::083171867610:role/afro90s-github-cdk-pr`

### SES — verificação antecipada (dev)

- [ ] No console SES (`us-east-1`): verificar e-mail remetente (sandbox)
- [ ] Verificar também o e-mail destino (admin) — sandbox exige ambos
- [ ] Anotar e-mail verificado para usar em task 09

## Pré-requisitos

Nenhum — esta é a primeira task.

## Critérios de conclusão

- [ ] `npm run build` sem erros dentro de `infra/`
- [ ] `npm run synth:dev` gera CloudFormation (mesmo com stacks vazias)
- [ ] `aws sts get-caller-identity --profile kevincrys-admin` retorna conta `083171867610`
- [ ] Stack `CDKToolkit` visível no CloudFormation
- [ ] Roles IAM das 3 criadas
- [ ] Environments configurados no GitHub
- [ ] Atualizar **Status** para `concluída`
