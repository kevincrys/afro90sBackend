# Frontend — UI/UX

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Requisitos de interface e experiência do usuário para o Afro90s v1.

## Responsividade

- Abordagem **mobile-first**
- Breakpoints sugeridos (Tailwind-compatible):

| Nome | Largura mínima |
|------|----------------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

- Catálogo: grid 1 coluna (mobile) → 2–3 colunas (tablet/desktop)
- Checkout: formulário em coluna única no mobile; resumo lateral em desktop

## Loading skeletons

Exibir skeletons (não spinners isolados) durante carregamento de dados da API:

| Tela | Skeleton |
|------|----------|
| Catálogo | Cards de produto (imagem + 2 linhas de texto) |
| Detalhe | Imagem grande + blocos de texto |
| Checkout | Resumo do carrinho + campos do formulário |
| Admin — produtos | Tabela ou lista com linhas placeholder |
| Admin — pedidos | Linhas de tabela placeholder |

Usar `isLoading` / `isFetching` do React Query para alternar skeleton ↔ conteúdo.

## Tema anos 90

Guidelines (não design final — editável):

- Paleta vibrante: roxo, rosa neon, amarelo, verde água sobre fundo escuro ou off-white
- Tipografia com personalidade (display para títulos; sans legível para corpo)
- Elementos visuais: padrões geométricos, gradientes, bordas arredondadas estilo retro
- Fotos de produto em destaque; UI não deve competir com o catálogo

## Estados da interface

| Estado | Comportamento |
|--------|---------------|
| Loading | Skeleton |
| Empty | Mensagem amigável + CTA (ex.: "Nenhum produto encontrado") |
| Error | Mensagem clara + botão "Tentar novamente" |
| Success | Feedback visual breve (toast ou banner) |

## Acessibilidade

- Labels em todos os campos de formulário (checkout)
- Foco visível em elementos interativos
- Contraste mínimo **WCAG AA**
- Texto alternativo em imagens de produto (`alt` = nome do produto)
- Navegação por teclado no catálogo e checkout

## Carrinho (v1)

- Estado local (Context ou Zustand) — sem persistência em servidor
- Indicador de quantidade no header
- Persistência opcional em `localStorage`

## Admin — upload de imagens

No formulário de produto, suportar:

1. **URL** — campo de texto para colar link
2. **Arquivo** — input file → enviar como `multipart/form-data` (stream) ou converter para base64 (JSON)
3. Preview das imagens antes de salvar

Ver modos A e B em [api-routes.md](../backend/api-routes.md#post-adminproducts).

## Referências

- [Overview](overview.md)
- [Integração](integration.md)
