# Como Contribuir — afro90sBackend

## Fluxo

1. Branch `feat/` ou `fix/` a partir de `main` ou `dev`
2. PR com CI verde (coverage ≥ 80%)
3. Merge em `dev` → **deploy automático** da Lambda dev
4. Merge em `main` → deploy production (approval)

## Deploy

Este repo **publica o código Lambda**. Não é necessário merge na infra para cada mudança de handler — apenas na primeira vez (recursos) ou quando env vars/IAM mudarem.

Ver [00-deploy-api.md](docs/specs/backend/tasks/00-deploy-api.md).

## PR checklist

- [ ] CI verde
- [ ] Contrato API atualizado se aplicável
- [ ] Nenhum secret commitado
