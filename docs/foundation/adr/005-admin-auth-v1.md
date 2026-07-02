# ADR-005: Autenticação admin-only na v1 (Cognito)

**Status:** Aceito  
**Data:** 2025-06-23  
**Autores:** Equipe Afro90s

## Contexto

A v1 do Afro90s não terá login para clientes finais nem processamento de pagamento online. Administradores precisam de acesso protegido para CRUD de produtos e gestão de pedidos.

## Decisão

- **Sem autenticação de cliente** na v1 — rotas públicas (`/products`, `/orders`) acessíveis sem token
- **Cognito User Pool** exclusivo para administradores
- Rotas `/admin/*` protegidas por **JWT authorizer** no API Gateway
- Self-signup desabilitado; contas admin criadas manualmente (console ou script)
- Header obrigatório: `Authorization: Bearer <access_token>`

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| API Key simples | Sem gestão de usuários; rotação e auditoria frágeis |
| Login de cliente na v1 | Fora de escopo; adia complexidade de checkout autenticado |
| Auth0 / Clerk | Custo e dependência externa desnecessários para poucos admins |

## Consequências

**Positivas**

- Separação clara público vs admin
- Integração nativa API Gateway + Cognito
- Base para painel admin no frontend

**Negativas**

- Pedidos anônimos — identificação apenas por dados do formulário (nome, tel, endereço)
- Gestão manual de usuários admin

## Referências

- [Project overview](../project-overview.md)
- [API routes](../../specs/backend/api-routes.md)
