# Guia para Agentes de IA — afro90sBackend

## Antes de implementar

1. [docs/foundation/vision.md](docs/foundation/vision.md)
2. **[docs/specs/backend/api-routes.md](docs/specs/backend/api-routes.md)**
3. [docs/specs/backend/tasks/](docs/specs/backend/tasks/)
4. [.cursor/rules/](.cursor/rules/)

## Deploy

- **Código Lambda** → `npm run bundle` + workflows `deploy-*.yml` (S3 + `update-function-code`)
- **Não** implementar `NodejsFunction` ou deploy CDK neste repo
- Config Lambda → afro90sInfra

Spec: [docs/specs/backend/tasks/00-deploy-api.md](docs/specs/backend/tasks/00-deploy-api.md)

## O que não fazer

- Não commitar secrets
- Não provisionar AWS (CDK = afro90sInfra)
- Não sobrescrever deploy model com CDK bundling
