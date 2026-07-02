# Configuração de Pipelines — afro90sBackend

Guia para configurar **GitHub Actions**, **Environments** e **branch protection** neste repositório.

> Setup AWS compartilhado (OIDC provider, conta, região): ver guia completo no [afro90sInfra](https://github.com/kevincrys/afro90sInfra/blob/main/docs/foundation/github-pipeline-setup.md).

## Repositório

| Campo | Valor |
|-------|-------|
| GitHub | `kevincrys/afro90sBackend` |
| Pipeline | CI only (sem deploy AWS direto) |
| Deploy Lambda | Via CDK no **afro90sInfra** |

## Branches

| Branch | Uso |
|--------|-----|
| `main` | Production — merge via PR + CI verde |
| `dev` | Integração — CI em todo push |

```bash
git checkout -b dev && git push -u origin dev
```

## Workflow

### `.github/workflows/ci.yml`

| Campo | Valor |
|-------|-------|
| Trigger | `pull_request` + `push` (todas branches) |
| Node | 20 |
| Steps | `npm ci` → `npm run build` → `npm run test:coverage` → `npm run lint` |
| Falha | Cobertura < 80% ou erros de lint/typecheck |

Spec de implementação: [backend/tasks/00-setup-repo.md](../specs/backend/tasks/00-setup-repo.md)

### OIDC AWS (opcional na v1)

O CI do backend **não precisa de AWS** na fase inicial (testes com mocks). Se testes de integração exigirem AWS:

| Role IAM | Trigger |
|----------|---------|
| `afro90s-github-backend-pr` | `repo:kevincrys/afro90sBackend:pull_request` |
| `afro90s-github-backend-dev` | `repo:kevincrys/afro90sBackend:ref:refs/heads/dev` |

## GitHub Environments

| Environment | Quando usar | Variables |
|-------------|-------------|-----------|
| `dev` | Jobs futuros com AWS (integração) | `AWS_ROLE_ARN`, `AWS_REGION` |
| `production` | Idem para main | `AWS_ROLE_ARN`, `AWS_REGION` |

Na v1, o workflow `ci.yml` **não** precisa de `environment:`.

**Repository variables** recomendadas:

| Nome | Valor |
|------|-------|
| `NODE_VERSION` | `20` |

## Branch protection — `main`

**Settings → Branches → Add rule** (ou Rulesets):

| Opção | Valor |
|-------|-------|
| Require pull request | ✅ · 1 approval |
| Require status checks | ✅ · check name: `ci` (ou nome do job) |
| Require up to date | ✅ |
| Block force push | ✅ |

## Rulesets (alternativa)

**Settings → Rules → New ruleset** targeting `main`:

- Require PR + 1 approval
- Require status check `ci`
- Block force pushes

## Relação com deploy

```
afro90sBackend: PR → CI passa → merge
       ↓
afro90sInfra: CDK referencia/bundle deste repo → cdk deploy → Lambda atualizada
```

Garanta que merges em `dev`/`main` do backend precedam ou acompanhem deploy infra quando houver mudança de código.

## Checklist

- [ ] Branch `dev` criada
- [ ] `.github/workflows/ci.yml` commitado
- [ ] Branch protection em `main` com required check `ci`
- [ ] PR de teste passa build + test + lint
- [ ] (Opcional) Roles IAM se CI precisar AWS

## Referências

- [Pipeline overview](../specs/pipelines/overview.md)
- [Task 00 — setup](../specs/backend/tasks/00-setup-repo.md)
- [Guia completo (infra)](https://github.com/kevincrys/afro90sInfra/blob/main/docs/foundation/github-pipeline-setup.md)
