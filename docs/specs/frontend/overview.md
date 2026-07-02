# Frontend — Overview

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Guia de implementação do frontend Afro90s no repositório futuro `afro90s-web`.

## Stack

| Componente | Tecnologia |
|------------|------------|
| Framework | **React 18** |
| Build | **Vite** |
| Linguagem | **TypeScript** |
| Roteamento | React Router v6 |
| Data fetching | TanStack Query (React Query) |
| HTTP | fetch ou axios (tipado) |
| Auth admin | AWS Amplify Auth ou `amazon-cognito-identity-js` |
| Deploy | Build estático → S3 + CloudFront |

## Estrutura sugerida

```
afro90s-web/
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── products.ts
│   │   └── orders.ts
│   ├── components/
│   │   ├── ui/              # botões, inputs, skeletons
│   │   ├── product/
│   │   └── layout/
│   ├── pages/
│   │   ├── CatalogPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   └── admin/
│   ├── hooks/
│   ├── contexts/            # carrinho (v1 local)
│   ├── types/               # espelham data-models.md
│   └── styles/
├── public/
├── index.html
└── vite.config.ts
```

## Páginas v1

| Rota | Página | Auth |
|------|--------|------|
| `/` | Catálogo | Pública |
| `/produto/:id` | Detalhe do produto | Pública |
| `/checkout` | Formulário de pedido | Pública |
| `/admin/login` | Login Cognito | — |
| `/admin/produtos` | CRUD produtos | Admin |
| `/admin/pedidos` | Gestão de pedidos | Admin |

## Contrato com a API

Rotas e payloads: **[api-routes.md](../backend/api-routes.md)**.

Variáveis de ambiente: **[outputs da infra](../infra/outputs.md)**.

Refinamento incremental das specs: **[tasks/README.md](tasks/README.md)** (backlog por tarefa).

## Referências

- [UI/UX](ui-ux.md)
- [Integração](integration.md)
- [Visão do produto](../../foundation/project-overview.md)
