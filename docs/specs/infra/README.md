# Specs de infraestrutura (espelho)

**Canônico:** [kevincrys/afro90sInfra](https://github.com/kevincrys/afro90sInfra) — `docs/specs/infra/`

Esta pasta é uma **cópia de referência** para consulta no repo backend (contratos, outputs, tasks). Em caso de divergência, prevalece o **afro90sInfra**.

## Sincronização

Copiar do repo infra quando tasks 08–12 (ou equivalente) forem atualizadas:

```bash
# a partir da raiz do monorepo / workspace
cp -r afro90sInfra/docs/specs/infra/* afro90sBackend/docs/specs/infra/
```

Deploy deste repo: ver [../backend/tasks/00-deploy-api.md](../backend/tasks/00-deploy-api.md) e [../../foundation/github-pipeline-setup.md](../../foundation/github-pipeline-setup.md).
