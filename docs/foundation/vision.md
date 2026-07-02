# Visão e Escopo — afro90sInfra

## Objetivo

Provisionar, configurar e operar a infraestrutura necessária para o projeto **Afro90s**, de forma reprodutível, segura e documentada.

Este repositório é a fonte da verdade para:

- Definição de ambientes (`dev`, `production`)
- Recursos de cloud e rede (AWS via CDK)
- Políticas de acesso (IAM, secrets)
- Pipelines de deploy de infraestrutura
- **Specs centralizadas** de backend e frontend (contratos para repos de aplicação)

## Escopo

- Infraestrutura como código (AWS CDK em TypeScript)
- Configuração de ambientes e recursos compartilhados
- Documentação técnica (specs, ADRs, arquitetura)
- Automação de provisionamento e deploy
- Especificações de API, modelos de dados e requisitos de frontend

## Fora de escopo

- Código-fonte das aplicações (implementação Lambda e React vive em `afro90s-api` e `afro90s-web`)
- Lógica de negócio executável
- Conteúdo editorial ou assets de mídia finais
- Gerenciamento de dependências de aplicação (npm dos repos de app)

Repositórios de aplicação consomem **outputs** e seguem **specs** definidas aqui.

## Princípios

1. **Reprodutibilidade** — ambientes criados a partir de código versionado, não configuração manual ad hoc.
2. **Segurança por padrão** — least privilege, secrets fora do repositório, recursos com tags e auditoria.
3. **Documentação viva** — specs e ADRs acompanham mudanças estruturais.
4. **Simplicidade** — preferir soluções diretas; complexidade só quando justificada em ADR.

## Stakeholders

| Papel | Responsabilidade |
|-------|------------------|
| Maintainer de infra | Evolução do repo, review de PRs, ADRs |
| Desenvolvedores | Consumir outputs e specs; implementar em repos de app |
| Agentes de IA | Seguir AGENTS.md, specs e rules ao implementar |

## Roadmap inicial

- [x] Definir cloud provider e stack IaC (ADRs 002–004)
- [x] Specs de backend, frontend e infra
- [ ] Implementar stacks CDK em `infra/`
- [ ] Pipeline CI/CD (validate + diff + deploy dev; production manual)
- [ ] Provisionar ambiente `dev`
- [ ] Integração com repositórios `afro90s-api` e `afro90s-web`

## Referências

- [Visão do produto Afro90s](project-overview.md)
- [Arquitetura](architecture.md)
- [Glossário](glossary.md)
- [ADRs](adr/)
- [Specs](../specs/)
