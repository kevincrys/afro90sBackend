# Tasks — Frontend Afro90s (entregas faseadas)

Backlog de implementação da SPA no repositório **`afro90sFrontend`**.
Organizado em **4 fases** alinhadas com [`infra/tasks/`](../../infra/tasks/README.md) e [`backend/tasks/`](../../backend/tasks/README.md).

## Legenda de status

| Status | Significado |
|--------|-------------|
| `pendente` | Não iniciada |
| `em andamento` | Em implementação |
| `concluída` | Critérios de conclusão verificados |

---

## Fase 0 — Fundação

> Setup do repo, tema visual, roteamento, cliente API e pipeline de deploy.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 00 | [00-setup-repo.md](00-setup-repo.md) | Vite + React + TS + Tailwind + Zustand |
| 01 | [01-tema-visual.md](01-tema-visual.md) | Paleta `#7A004B`/`#FFD21F`, componentes base |
| 02 | [02-roteamento-layout.md](02-roteamento-layout.md) | React Router, layouts, 404 |
| 03 | [03-api-client.md](03-api-client.md) | Axios + React Query + tipos |
| 04 | [04-cicd-deploy.md](04-cicd-deploy.md) | GitHub Actions → S3 + CloudFront |

---

## Fase 1 — Site público

> **Entregável:** loja no ar — catálogo, detalhe, carrinho drawer, checkout e WhatsApp.
> Sem login, sem admin.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 05 | [05-catalogo.md](05-catalogo.md) | Página `/` com scroll infinito |
| 06 | [06-produto-detalhe.md](06-produto-detalhe.md) | `/produto/:id` + galeria modal |
| 07 | [07-carrinho-checkout.md](07-carrinho-checkout.md) | Drawer carrinho + checkout Zod |
| 08 | [08-whatsapp.md](08-whatsapp.md) | Abertura automática wa.me pós-pedido |
| 09 | [09-states-a11y.md](09-states-a11y.md) | Skeletons, toasts, acessibilidade |
| 10 | [10-aceite-fase1.md](10-aceite-fase1.md) | Checklist aceite fase 1 |

**✓ Resultado:** `https://*.cloudfront.net` com loja funcional.

---

## Fase 2 — Login admin

> **Entregável:** autenticação Cognito via Amplify. Painel admin ainda vazio.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 11 | [11-login-admin.md](11-login-admin.md) | Amplify SRP + `ProtectedRoute` |
| 12 | [12-aceite-fase2.md](12-aceite-fase2.md) | Checklist aceite fase 2 |

**✓ Resultado:** admin faz login e acessa `/admin/pedidos`.

---

## Fase 3 — Painel admin

> **Entregável:** CRUD produtos com upload + gestão de pedidos.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 13 | [13-admin-produtos.md](13-admin-produtos.md) | Cards + modal CRUD + upload multipart |
| 14 | [14-admin-pedidos.md](14-admin-pedidos.md) | Tabs status + drawer detalhe |
| 21 | [21-nome-produto-no-pedido.md](21-nome-produto-no-pedido.md) | Nome do produto na admin + WhatsApp |
| 15 | [15-aceite-fase3.md](15-aceite-fase3.md) | Checklist aceite fase 3 |

**✓ Resultado:** admin gerencia produtos e pedidos.

---

## Fase 4 — Qualidade final

> **Entregável:** testes E2E Cypress + regressão completa.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 16 | [16-testes-e2e.md](16-testes-e2e.md) | Cypress specs por fase + Vitest unit |
| 17 | [17-aceite-fase4.md](17-aceite-fase4.md) | Checklist aceite frontend v1 |

**✓ Resultado:** frontend v1 completo e testado.

---

## Alinhamento cross-repo

| Fase | O que o usuário vê | Infra | Backend | Frontend |
|------|-------------------|-------|---------|----------|
| 1 | Loja pública + pedido | fase 1 | fase 1 | fase 1 |
| 2 | Login admin | fase 2 | fase 2 | fase 2 |
| 3 | Painel admin | fase 3 | fase 3 | fase 3 |
| 4 | E-mail + testes | fase 4 | fase 4 | fase 4 |

## Ordem de deploy por fase

1. **Infra** deploya recursos (`afro90sInfra` → merge `dev`)
2. **Backend** deploya Lambdas (`afro90sBackend` → CI bundle + S3 + `update-function-code`)
3. **Frontend** deploya SPA (`afro90sFrontend` → CI build + `s3 sync`)

## Referências

- [UI/UX](../ui-ux.md)
- [Integration](../integration.md)
- [API routes](../../backend/api-routes.md)
- [Infra outputs](../../infra/outputs.md)
