# Frontend — Integração com API e serviços

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Descrever como o frontend consome a API, Cognito e WhatsApp.

## Variáveis de ambiente

| Variável | Uso |
|----------|-----|
| `VITE_API_BASE_URL` | Base da API REST |
| `VITE_ASSETS_CDN_URL` | Prefixo de URLs de imagens (se relativas) |
| `VITE_WHATSAPP_NUMBER` | Número da loja (somente dígitos, com DDI) |
| `VITE_COGNITO_USER_POOL_ID` | Login admin |
| `VITE_COGNITO_CLIENT_ID` | Login admin |
| `VITE_COGNITO_REGION` | Região Cognito |

## Cliente HTTP

```typescript
// src/api/client.ts — esboço
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const headers: HeadersInit = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, { headers });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

Tipos alinhados a [data-models.md](../backend/data-models.md).

## Endpoints consumidos (público)

| Ação | Método | Rota | Spec |
|------|--------|------|------|
| Listar produtos | `GET` | `/products?limit=&cursor=&name=` | [api-routes](../backend/api-routes.md#get-products) |
| Detalhe | `GET` | `/products/{id}` | [api-routes](../backend/api-routes.md#get-productsid) |
| Criar pedido | `POST` | `/orders` | [api-routes](../backend/api-routes.md#post-orders) |

## Endpoints consumidos (admin)

Requer token Cognito em `Authorization: Bearer <access_token>`.

| Ação | Método | Rota |
|------|--------|------|
| Listar produtos | `GET` | `/admin/products` |
| Criar produto | `POST` | `/admin/products` |
| Editar produto | `PUT` | `/admin/products/{id}` |
| Excluir produto | `DELETE` | `/admin/products/{id}` |
| Ajustar estoque | `PUT` | `/admin/products/{id}/stock` |
| Listar pedidos | `GET` | `/admin/orders` — query opcional `q` (busca por ID ou prefixo do nome do cliente) |
| Detalhe pedido | `GET` | `/admin/orders/{id}` |
| Atualizar status | `PUT` | `/admin/orders/{id}` |

Detalhes de payload: [api-routes.md](../backend/api-routes.md).

### Busca de pedidos (admin)

Task 20 — barra de busca na tab Pedidos (`AdminOrdersTab`).

| Camada | Arquivo | Responsabilidade |
|--------|---------|------------------|
| UI | `src/components/admin/AdminOrdersTab.tsx` | Input + debounce; passa `{ status, q }` ao hook |
| Hook | `src/hooks/useAdminOrders.ts` | `useInfiniteQuery` com key `['admin', 'orders', filters]` |
| Client | `src/api/admin/orders.ts` | `getAdminOrders({ status, q, limit, cursor })` |
| API | `GET /admin/orders` | Filtra por `q` (ID ou prefixo de nome) + `status` opcional |

**Regras de chamada:**

- Sem busca: `GET /admin/orders?limit=20` (+ `status` se tab ≠ TODOS)
- Com busca (≥ 2 chars): incluir `q` — ex.: `GET /admin/orders?limit=20&q=maria`
- Paginação: repetir `status` e `q` + `cursor=nextCursor` da página anterior
- Mínimo 2 caracteres em `q` (frontend não envia antes; backend retorna `400 INVALID_QUERY` se violado)

```typescript
// useAdminOrders → getAdminOrders (trecho)
getAdminOrders({
  status: filters.status,
  q: filters.q,
  limit: 20,
  cursor: pageParam,
});
```

## Upload de imagens (admin)

### Opção 1 — JSON com base64

```typescript
await apiPost('/admin/products', {
  name, price, quantity, category,
  photos: [
    { type: 'url', value: 'https://...' },
    { type: 'base64', value: base64String, filename: 'foto.jpg', contentType: 'image/jpeg' },
  ],
}, adminToken);
```

### Opção 2 — Multipart com stream

```typescript
const form = new FormData();
form.append('name', name);
form.append('price', String(price));
form.append('quantity', String(quantity));
form.append('category', category);
form.append('photo_0', file);
form.append('photos', JSON.stringify([
  { type: 'stream', fieldName: 'photo_0' },
]));
await fetch(`${baseUrl}/admin/products`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});
```

## Fluxo de checkout

```
1. Usuário preenche formulário em /checkout
2. POST /orders com items + customer
3. Se 201:
   a. Exibir confirmação com orderId
   b. Abrir WhatsApp (wa.me)
   c. Limpar carrinho local
4. Se erro: exibir mensagem da API (code + message)
```

## Integração WhatsApp (v1)

Após pedido criado com sucesso ([ADR-006](../../foundation/adr/006-whatsapp-integration.md)):

```typescript
function formatWhatsAppItems(items: OrderItem[]): string {
  if (!items?.length) return '';
  return items
    .map((item) => {
      const name = item.productName ?? 'Produto';
      const option = item.selectedOption ? ` (${item.selectedOption})` : '';
      return `- ${name}${option} x${item.quantity}`;
    })
    .join('\n');
}

function openWhatsAppOrder(order: Order) {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
  const itemsBlock = formatWhatsAppItems(order.items);
  const text = encodeURIComponent(
    `Olá! Novo pedido #${order.id}\n` +
    `Total: R$ ${order.fullPrice.toFixed(2)}\n` +
    (itemsBlock ? `Itens:\n${itemsBlock}\n` : `Itens: ${order.items.length}\n`) +
    `Nome: ${order.customer.name}\n` +
    `Tel: ${order.customer.tel}`
  );
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}
```

- `productName` vem do snapshot da API (`OrderItem`) ou do carrinho local (`CartItem.name`) ao montar o pedido pós-checkout.
- Pedidos/itens sem `productName`: usar fallback `'Produto'` na mensagem e `productId` truncado na admin (task 21).

## Autenticação admin (Cognito)

- Login em `/admin/login`
- Armazenar `accessToken` em memória (ou sessionStorage)
- Interceptor adiciona header em rotas `/admin/*`
- Redirect para login se `401` em rota protegida

## React Query — chaves sugeridas

| Chave | Query |
|-------|-------|
| `['products', { cursor, name }]` | `GET /products` |
| `['product', id]` | `GET /products/{id}` |
| `['admin', 'products', filters]` | `GET /admin/products` |
| `['admin', 'orders', filters]` | `GET /admin/orders` |

## Referências

- [API routes](../backend/api-routes.md)
- [Outputs infra](../infra/outputs.md)
- [UI/UX](ui-ux.md)
