# ADR-001: Estrutura de documentação do repositório

**Status:** Aceito  
**Data:** 2025-06-23  
**Autores:** Equipe Afro90s

## Contexto

O repositório `afro90sInfra` está sendo iniciado do zero. Precisamos de uma estrutura clara para specs, regras de agentes de IA, fundamentações e código de infra — evitando documentação espalhada ou misturada com código.

## Decisão

Adotar a seguinte organização:

```
afro90sInfra/
├── README.md                 # entrada humana
├── AGENTS.md                 # entrada para agentes de IA
├── CONTRIBUTING.md           # fluxo de contribuição
├── docs/
│   ├── foundation/           # visão, arquitetura, glossário, ADRs
│   └── specs/                # especificações por domínio
└── .cursor/
    └── rules/                # regras persistentes Cursor (.mdc)
```

Regras:

- **Foundation** responde *por quê* e *como o sistema se organiza*.
- **Specs** respondem *o quê* deve ser implementado.
- **ADRs** registram decisões irreversíveis ou de alto impacto.
- **Cursor rules** codificam convenções acionáveis para implementação (< 50 linhas por rule).
- Código IaC ficará na raiz ou em pastas dedicadas (`infra/`, `modules/`) — a definir no ADR de stack.

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| Tudo no README | Não escala; mistura audiências (humano vs agente) |
| Specs na raiz | Poluição do top-level; difícil navegar |
| Sem ADRs | Decisões se perdem no histórico de PRs |
| Rules só em AGENTS.md | AGENTS.md é índice; rules precisam de escopo por glob |

## Consequências

**Positivas**

- Onboarding claro para humanos e agentes de IA
- Separação entre decisão (ADR), requisito (spec) e convenção (rule)
- Base para crescimento do monorepo Afro90s

**Negativas**

- Overhead inicial de manter docs sincronizados com código
- Requer disciplina para criar ADR/spec antes de mudanças grandes

## Referências

- [Visão](../vision.md)
- [Arquitetura](../architecture.md)
- [AGENTS.md](../../../AGENTS.md)
