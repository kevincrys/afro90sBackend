# Como Contribuir — afro90sBackend

## Fluxo de trabalho

1. Crie uma branch a partir de `main` ou `dev`: `feat/descricao-curta` ou `fix/descricao-curta`.
2. Se alterar contrato HTTP, atualize [docs/specs/backend/api-routes.md](docs/specs/backend/api-routes.md) e sincronize com [afro90sInfra](https://github.com/kevincrys/afro90sInfra).
3. Implemente seguindo a task em [docs/specs/backend/tasks/](docs/specs/backend/tasks/).
4. Garanta `npm run build`, `npm test` e `npm run lint` passando localmente.
5. Abra PR — CI deve passar (coverage ≥ 80%).

## Commits

```
feat: add GET /products with cursor pagination
fix: validate order payload with Zod
test: cover product service edge cases
docs: update api-routes for admin POST
```

## Documentação

| Mudança | Onde documentar |
|---------|-----------------|
| Nova/alterada rota API | `docs/specs/backend/api-routes.md` (+ afro90sInfra) |
| Novo modelo/campo | `docs/specs/backend/data-models.md` |
| Nova task ou fase | `docs/specs/backend/tasks/` |
| Pipeline CI | `docs/specs/pipelines/overview.md` |

## Revisão de PR

- [ ] CI verde (build, test, lint)
- [ ] Cobertura ≥ 80%
- [ ] Contrato API atualizado se aplicável
- [ ] Nenhum secret commitado
- [ ] Link para task/spec relacionada

## Deploy

Merge neste repo **não** faz deploy automático. Após merge, o pipeline do **afro90sInfra** deve incluir o código atualizado no próximo `cdk deploy`.
