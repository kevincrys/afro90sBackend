# Pipelines — afro90sBackend

**Status:** Rascunho  
**Última atualização:** 2025-06-23

## Escopo deste repositório

Pipeline de **integração contínua** — validação de código em todo PR e push. **Deploy** da Lambda é responsabilidade do **afro90sInfra** (CDK).

## Workflow planejado

| Workflow | Arquivo | Trigger | Ação |
|----------|---------|---------|------|
| CI | `ci.yml` | PR + push (all branches) | build → test:coverage → lint |

## Requisitos de CI

| Check | Critério |
|-------|----------|
| TypeScript | `npm run build` sem erros |
| Testes | `npm run test:coverage` — cobertura ≥ 80% |
| Lint | `npm run lint` sem erros |

## Configuração GitHub

Guia: [github-pipeline-setup.md](../../foundation/github-pipeline-setup.md)

- **Environments:** opcionais na v1 (CI sem AWS)
- **Branch protection:** `main` exige PR + status check `ci`
- **Secrets:** nenhum necessário na v1

## Task de implementação

| Task | Descrição | Status |
|------|-----------|--------|
| [00-setup-repo](../backend/tasks/00-setup-repo.md) | Estrutura + `ci.yml` | pendente |

## Fluxo com afro90sInfra

```
1. Dev abre PR no afro90sBackend → CI passa → merge
2. afro90sInfra CDK bundle/deploy inclui código atualizado
3. Lambda em dev/prod reflete nova versão
```

## Critérios de aceite (fase 0)

- [ ] `ci.yml` roda em todo PR
- [ ] Merge bloqueado se CI falhar
- [ ] Cobertura mínima 80% enforced no workflow
- [ ] Nenhum secret no repositório
