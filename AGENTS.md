# Guia para Agentes de IA

Este arquivo orienta assistentes de IA (Cursor, Copilot, etc.) ao trabalhar neste repositório.

## Antes de implementar

1. Leia [docs/foundation/project-overview.md](docs/foundation/project-overview.md) para entender o produto Afro90s.
2. Leia [docs/foundation/vision.md](docs/foundation/vision.md) para o escopo deste repo.
3. Consulte [docs/foundation/architecture.md](docs/foundation/architecture.md) para alinhar com a arquitetura.
4. Verifique a spec da **esfera** relevante (tabela abaixo).
5. Para qualquer endpoint ou contrato HTTP, leia **[docs/specs/backend/api-routes.md](docs/specs/backend/api-routes.md)**.
6. Siga as regras em [.cursor/rules/](.cursor/rules/).

## Onde encontrar o quê

| Tipo | Local |
|------|-------|
| Visão do produto | `docs/foundation/project-overview.md` |
| Fundamentação (por quê) | `docs/foundation/` |
| Especificações (o quê) | `docs/specs/` |
| **API — rotas, headers, payloads** | `docs/specs/backend/api-routes.md` |
| Decisões arquiteturais | `docs/foundation/adr/` |
| Regras de código/convenções | `.cursor/rules/` |
| Glossário do domínio | `docs/foundation/glossary.md` |

## Specs por esfera

| Esfera | Entry point | Documentos principais |
|--------|-------------|----------------------|
| **CDK / Infra** | `docs/specs/infra/overview.md` | `cdk.md`, `resources.md`, `outputs.md` |
| **Backend** | `docs/specs/backend/overview.md` | `data-models.md`, **`api-routes.md`** |
| **Frontend** | `docs/specs/frontend/overview.md` | `ui-ux.md`, `integration.md` |

## Princípios

- **Spec first**: não implemente infra sem spec ou ADR correspondente quando a decisão for estrutural.
- **Mínimo escopo**: altere apenas o necessário para a tarefa.
- **Convenções existentes**: siga padrões já estabelecidos no repo antes de introduzir novos.
- **Documentar decisões**: mudanças arquiteturais exigem novo ADR em `docs/foundation/adr/`.

## Stack

| Componente | Decisão |
|------------|---------|
| Cloud | AWS |
| IaC | AWS CDK (TypeScript) |
| Frontend | React 18 + Vite → S3 + CloudFront |
| Backend | Lambda Node.js 20 + API Gateway |
| Banco | DynamoDB |
| Auth admin | Cognito (sem login de cliente na v1) |

Consulte `docs/specs/infra/overview.md` e ADRs 002–006 antes de assumir outras tecnologias.

## O que não fazer

- Não commitar secrets, `.env` ou credenciais.
- Não alterar documentação de fundamentação sem solicitação explícita.
- Não criar recursos de infra fora do escopo da spec/ADR em vigor.
- Não implementar endpoints que divergem de `api-routes.md` sem atualizar a spec primeiro.
