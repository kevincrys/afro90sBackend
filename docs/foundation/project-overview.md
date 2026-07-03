# Visão do Produto — Afro90s

> Documento de entrada do **produto** Afro90s. Para escopo deste repositório de infra, ver [vision.md](vision.md).

## O que é

**Afro90s** é um e-commerce de produtos voltados ao público negro, com identidade visual e narrativa inspiradas nos **anos 90**. A aplicação web permite navegar catálogo, montar pedidos e concluir a compra via contato WhatsApp, sem pagamento online na v1.

## Público

| Público | Acesso v1 |
|---------|-----------|
| **Compradores** | Catálogo e checkout **sem login** |
| **Administradores** | Painel protegido com **Amazon Cognito** |

## Fluxo principal (v1)

```
Catálogo → Detalhe do produto → Carrinho/Checkout
    → POST /orders (status SOLICITADO)
    → E-mail ao admin (SES)
    → Cliente abre WhatsApp com resumo do pedido (frontend)
    → Admin atualiza status do pedido no painel
```

## Domínio — Produto

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | Identificador único |
| `name` | string | Nome do produto |
| `price` | number | Preço em BRL (decimal, ex.: `49.90`) |
| `quantity` | number | Unidades em estoque |
| `photos` | string[] | URLs públicas das imagens (S3/CloudFront) |
| `category` | enum | `oculos`, `acessorios`, `maquiagem` |

## Domínio — Pedido (Order)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | Identificador único |
| `status` | enum | Ver tabela abaixo |
| `items` | array | `{ productId, quantity, unitPrice }` |
| `fullPrice` | number | Soma dos itens |
| `customer` | object | `{ name, address, postalCode, tel }` |

### Status do pedido

| Status | Significado |
|--------|-------------|
| `SOLICITADO` | Pedido criado pelo cliente |
| `EM_ATENDIMENTO` | Admin iniciou atendimento |
| `AGUARDANDO_PAGAMENTO` | Aguardando confirmação de pagamento (WhatsApp) |
| `EM_PREPARACAO` | Pedido em separação |
| `ENVIADO` | Enviado ao cliente |
| `CONCLUIDO` | Pedido finalizado |
| `CANCELADO` | Pedido cancelado |

## Escopo v1

- Catálogo com paginação e busca por nome
- Detalhe de produto por ID
- Criação de pedido (checkout)
- E-mail de notificação (SES)
- Redirecionamento WhatsApp (link no frontend — ver [ADR-006](adr/006-whatsapp-integration.md))
- Painel admin: CRUD de produtos, ajuste de estoque, listagem e atualização de pedidos

## Fora de escopo v1

- Login e conta de cliente
- Pagamento online (cartão, PIX automático, etc.)
- Decremento automático de estoque no checkout (apenas validação de disponibilidade)
- Integração WhatsApp Business API no backend (pendente — ADR-006)

## Repositórios

| Repo | Responsabilidade | Specs neste repo |
|------|------------------|------------------|
| `afro90sInfra` | CDK, ambientes AWS | `docs/specs/infra/` |
| `afro90sBackend` | Monorepo API (`resources/` + `libs/`), deploy S3 | `docs/specs/backend/` |
| `afro90sFrontend` | React SPA | `docs/specs/frontend/` |

O código de aplicação vive em repos separados; **este repositório é a fonte central de specs e contratos**.

## Referências

- [Arquitetura](architecture.md)
- [API — todas as rotas](../specs/backend/api-routes.md)
- [Glossário](glossary.md)
