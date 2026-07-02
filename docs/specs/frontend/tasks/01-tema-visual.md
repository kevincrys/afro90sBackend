# Task 01 — Tema visual anos 90

**Fase:** 0 — Fundação  
**Status:** pendente  
**Arquivos alvo:** [`ui-ux.md`](../ui-ux.md)

## Objetivo

Configurar design system Tailwind com paleta Afro90s e componentes base reutilizáveis.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Cores primárias | `#7A004B` (roxo), `#FFD21F` (amarelo) |
| Fontes customizadas | Não na v1 |
| Tema | Único (sem dark mode) |
| Breakpoints | Padrão Tailwind (sm/md/lg/xl) |
| Grid catálogo | Até 4 colunas no desktop |
| Referências visuais | Já existem (moodboard) |

## O que implementar

### `tailwind.config.js` — theme extension

```javascript
theme: {
  extend: {
    colors: {
      primary: '#7A004B',
      accent: '#FFD21F',
    },
  },
},
```

### Componentes base em `src/components/ui/`

- [ ] `Button.tsx` — variantes: `primary`, `secondary`, `ghost`, `danger`; estados disabled/loading
- [ ] `Input.tsx` — com label, error message, suporte a máscaras
- [ ] `Card.tsx` — container com padding e border-radius
- [ ] `Badge.tsx` — para status e "Esgotado"
- [ ] `Skeleton.tsx` — placeholder animado (por página, não global)

### Layout

- [ ] `Header.tsx` — logo, barra de busca, categorias, ícone carrinho com badge
- [ ] `Footer.tsx` — links mínimos, copyright

### Meta

- [ ] `index.html`: favicon, `<title>Afro90s</title>`, meta viewport
- [ ] `document.title` dinâmico por página (implementado nas tasks de página)

## Pré-requisitos

- Task 00 concluída

## Critérios de conclusão

- [ ] Componentes base renderizam com cores da paleta
- [ ] Grid responsivo: 1 col mobile → 4 cols desktop
- [ ] `ui-ux.md` atualizado com tokens de design
- [ ] Atualizar **Status** para `concluída`
