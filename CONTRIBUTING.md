# Como Contribuir

## Fluxo de trabalho

1. Crie uma branch a partir de `main`: `feat/descricao-curta` ou `fix/descricao-curta`.
2. Se a mudança for estrutural, abra ou atualize um ADR em `docs/foundation/adr/`.
3. Se introduzir nova capacidade de infra, documente em `docs/specs/`.
4. Abra um Pull Request com descrição clara do **por quê** e do **o quê**.
5. Aguarde review antes de merge em `main`.

## Commits

Use mensagens concisas no imperativo, focadas no propósito:

```
add módulo de rede para ambiente dev
fix policy IAM com permissão excessiva
docs: atualizar spec de ambientes
```

Prefixos opcionais: `feat`, `fix`, `docs`, `refactor`, `chore`.

## Documentação

| Mudança | Onde documentar |
|---------|-----------------|
| Decisão arquitetural | `docs/foundation/adr/NNN-titulo.md` |
| Novo requisito de infra | `docs/specs/infra/` ou subpasta correspondente |
| Termo novo do domínio | `docs/foundation/glossary.md` |
| Mudança de escopo | `docs/foundation/vision.md` |

## ADRs

Numere sequencialmente: `001-`, `002-`, etc. Use o template em `docs/foundation/adr/001-repo-structure.md` como referência de formato.

## Revisão

PRs devem incluir:

- Link para spec ou ADR relacionado (quando aplicável)
- Plano de teste ou validação (ex.: `terraform plan`, checklist manual)
- Confirmação de que nenhum secret foi incluído
