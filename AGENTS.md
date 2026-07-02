# Guia para Agentes de IA — afro90sBackend

Este repositório contém a **implementação da API Lambda** do Afro90s.

## Antes de implementar

1. Leia [docs/foundation/vision.md](docs/foundation/vision.md) — escopo deste repo.
2. Leia **[docs/specs/backend/api-routes.md](docs/specs/backend/api-routes.md)** — contrato HTTP obrigatório.
3. Consulte [docs/specs/backend/overview.md](docs/specs/backend/overview.md) e [data-models.md](docs/specs/backend/data-models.md).
4. Verifique a task correspondente em [docs/specs/backend/tasks/](docs/specs/backend/tasks/).
5. Siga as regras em [.cursor/rules/](.cursor/rules/).

## Onde encontrar o quê

| Tipo | Local |
|------|-------|
| Escopo deste repo | `docs/foundation/vision.md` |
| **Contrato API** | `docs/specs/backend/api-routes.md` |
| Modelos DynamoDB | `docs/specs/backend/data-models.md` |
| Tasks de implementação | `docs/specs/backend/tasks/` |
| Pipeline CI | `docs/specs/pipelines/overview.md` |
| Setup GitHub | `docs/foundation/github-pipeline-setup.md` |
| Regras Cursor | `.cursor/rules/` |

## Documentação central

ADRs, arquitetura global e specs canônicas: [afro90sInfra](https://github.com/kevincrys/afro90sInfra/tree/main/docs). Alterações de contrato API devem ser refletidas nos dois repos.

## Stack deste repo

| Componente | Decisão |
|------------|---------|
| Runtime | Lambda Node.js 20 |
| Linguagem | TypeScript strict |
| HTTP | Middy + router interno |
| Validação | Zod |
| Testes | Vitest (80% coverage) |
| Deploy | CDK no afro90sInfra — **não** implementar deploy aqui |

## Princípios

- **Contrato first** — não implementar endpoints fora de `api-routes.md`.
- **Diff mínimo** — altere só o necessário.
- **Testes** — toda rota/serviço novo com testes; CI exige 80% coverage.

## O que não fazer

- Não commitar secrets ou `.env`.
- Não provisionar recursos AWS (CDK fica no afro90sInfra).
- Não alterar frontend ou specs de infra sem escopo explícito.
- Não criar workflows de deploy Lambda neste repo.
