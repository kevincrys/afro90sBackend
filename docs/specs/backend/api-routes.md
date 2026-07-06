# API Routes — Catálogo completo

**Status:** Aprovado  
**Última atualização:** 2026-07-04

> Documento editável — fonte da verdade para métodos, headers, payloads e respostas de cada rota.

## Índice

1. [Convenções globais](#convenções-globais)
   - [Paginação (cursor opaco)](#paginação-cursor-opaco)
2. [Rotas públicas](#rotas-públicas)
3. [Rotas admin](#rotas-admin)
4. [Upload de imagens (produtos)](#upload-de-imagens-produtos)
5. [Códigos HTTP e erros](#códigos-http-e-erros)
6. [Resumo rápido](#resumo-rápido)

**Total: 11 rotas** (3 públicas + 8 admin)

---

## Convenções globais

### Base URL

```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
```

Exemplo: `https://abc123.execute-api.us-east-1.amazonaws.com/dev`

### Implementação (`@afro90s/http`)

Pacote compartilhado em `libs/http`, consumido por cada Lambda em `resources/{flow}/`.

| Export | Uso |
|--------|-----|
| `ok()`, `created()`, `noContent()`, `apiError()` | Respostas JSON; headers via `baseHeaders()` |
| `createHandler()` | Wrapper Middy: `X-Request-Id`, `OPTIONS` → 204, catch de `ApiError`/`ZodError`/`500` |
| `resolveRequestId()` | Lê header `X-Request-Id`; gera UUID v4 se ausente |

**CORS automático:** `corsHeaders()` é mesclado em `baseHeaders()` — toda resposta dos helpers acima já inclui `Access-Control-Allow-Origin`, métodos e headers permitidos. Não é necessário wrapper manual por rota.

**Origem CORS:** `CLOUDFRONT_WEB_URL`; em `NODE_ENV=development` aceita `http://localhost:5173` se a env não estiver definida.

**Idioma:** `ApiError.message` em pt-BR; `ApiError.code` em inglês (`NOT_FOUND`, `VALIDATION_ERROR`, …).

### Auth — evitar `403` na API

| Contexto | Comportamento |
|----------|---------------|
| **API (v1)** | **Não retornar `403`** — token ausente, inválido ou usuário sem grupo `admins` → sempre **`401 UNAUTHORIZED`** (task 10). |
| **CloudFront (SPA)** | `403` em path estático inexistente → custom error para `/index.html` (200). É **roteamento do frontend**, não resposta JSON da API. |

`FORBIDDEN` / `throwForbidden()` existem em `@afro90s/http` para extensão futura, mas **rotas v1 não devem emitir** esse código.

### Headers comuns (todas as rotas)

| Header | Obrigatório | Valor | Notas |
|--------|-------------|-------|-------|
| `Accept` | Recomendado | `application/json` | |
| `Content-Type` | Em requests com body | Ver rota | `application/json` ou `multipart/form-data` |
| `X-Request-Id` | Opcional | UUID | Rastreio; API pode ecoar na resposta |

### Headers de resposta comuns

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/json; charset=utf-8` (omitido em `204`) |
| `X-Request-Id` | ID da requisição (se enviado ou gerado) |
| `Access-Control-Allow-Origin` | Origem permitida (via `baseHeaders`) |
| `Access-Control-Allow-Methods` | `GET,POST,PUT,DELETE,OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization` |

### Paginação (cursor opaco)

Listagens (`GET /products`, `GET /admin/products`, `GET /admin/orders`) usam **paginação por cursor opaco** — não offset (`page=2`) e não “último id” exposto ao cliente.

#### O que é o cursor

| Propriedade | Descrição |
|-------------|-----------|
| **Opaco** | O cliente **não interpreta, não decodifica e não monta** o valor — apenas repassa `nextCursor` na próxima requisição |
| **Não é JWT** | Não tem assinatura nem claims de autenticação. Strings que começam com `eyJ` são comuns porque o payload interno é JSON em Base64 (`{"` → `eyJ`) |
| **Descartável** | Válido apenas para a **mesma rota** e os **mesmos filtros** da requisição que o gerou |
| **Opcional na 1ª página** | Omitir `cursor` na primeira chamada; enviar `nextCursor` da resposta anterior para continuar |

#### Formato da resposta

```json
{
  "items": [ "..."] ,
  "nextCursor": "eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCJ9",
  "hasMore": true
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `items` | array | Página atual (pode ter menos que `limit` itens) |
| `nextCursor` | string \| omitido | Presente quando existem mais itens; ausente ou `null` na última página |
| `hasMore` | boolean | `true` se há próxima página; `false` na última |

Regra: se `hasMore` é `false`, ignorar `nextCursor`. Se `hasMore` é `true`, `nextCursor` deve estar presente.

#### Query params de paginação

| Param | Tipo | Default | Max | Descrição |
|-------|------|---------|-----|-----------|
| `limit` | integer | `20` | `100` | Máximo de itens por página |
| `cursor` | string | — | — | Valor de `nextCursor` da resposta anterior (URL-encode se necessário) |

**Ao paginar**, repetir os mesmos filtros da primeira requisição (`name`, `category`, `status`, etc.) **e** enviar `cursor`. Exemplo:

```http
# Página 1
GET /products?limit=20&name=óculos

# Página 2 — mesmos filtros + cursor
GET /products?limit=20&name=óculos&cursor=eyJpZCI6Li4ufQ==
```

Alterar filtros com um `cursor` antigo → `400 INVALID_CURSOR` ou resultado inconsistente (comportamento indefinido; API deve rejeitar).

#### Como o backend gera o cursor (implementação)

O cursor encapsula a posição da leitura no **DynamoDB** (`LastEvaluatedKey` da `Query`/`Scan`), não o id do último item exibido.

Fluxo interno:

```
1. Query DynamoDB com Limit = limit (+ filtros da rota)
2. Se LastEvaluatedKey existe → há mais páginas
3. Montar payload interno (JSON) com:
   - chaves do índice usado (PK/SK ou GSI)
   - hash dos filtros da query (name, category, status…) para invalidar cursor trocado
4. Codificar: Base64URL( JSON.stringify(payload) ) → nextCursor
5. Na próxima request: decodificar cursor → ExclusiveStartKey + validar filtros
```

**Payload interno (exemplos — não exposto na API):**

Listagem de produtos **sem** `name` (tabela principal, PK `id`):

```json
{
  "v": 1,
  "index": "primary",
  "key": { "id": "550e8400-e29b-41d4-a716-446655440000" },
  "filters": { "category": "oculos" }
}
```

Listagem de produtos **com** `name` (tabela base, PK `id`):

```json
{
  "v": 1,
  "index": "primary",
  "key": { "id": "550e8400-e29b-41d4-a716-446655440000" },
  "filters": { "name": "óculos" }
}
```

Listagem de pedidos com `status` (GSI `gsi-status-createdAt`):

```json
{
  "v": 1,
  "index": "gsi-status-createdAt",
  "key": { "status": "SOLICITADO", "createdAt": "2025-06-23T14:30:00.000Z" },
  "filters": { "status": "SOLICITADO" }
}
```

> Por isso um único `after={id}` não basta: a continuação depende do **índice** e da **chave composta** usados na query, não só do último `id` visível no JSON.

#### Uso no frontend

```typescript
// Página 1
const page1 = await fetch('/products?limit=20&name=óculos');
const data1 = await page1.json();
// data1.items, data1.hasMore, data1.nextCursor

// Página 2 — repassar cursor sem alterar
if (data1.hasMore && data1.nextCursor) {
  const url = `/products?limit=20&name=óculos&cursor=${encodeURIComponent(data1.nextCursor)}`;
  const page2 = await fetch(url);
}
```

Padrão de UI recomendado: **“Carregar mais”** ou scroll infinito — não “página 5” (DynamoDB não suporta offset eficiente).

#### Erros de paginação

| Status | `code` | Quando |
|--------|--------|--------|
| `400` | `INVALID_CURSOR` | Cursor malformado, expirado (se houver TTL futuro) ou incompatível com filtros atuais |
| `400` | `INVALID_QUERY` | `limit` fora do intervalo permitido |

### Formato de erro

Corpo padrão (`ApiError` — `@afro90s/models` + `@afro90s/http`):

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dados inválidos.",
  "details": {
    "customer.postalCode": "CEP deve ter 8 dígitos."
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Campo | Descrição |
|-------|-----------|
| `code` | Identificador em inglês (snake/SCREAMING) |
| `message` | Mensagem legível em **pt-BR** |
| `details` | Opcional; mapa campo → mensagem (comum em `VALIDATION_ERROR`) |
| `requestId` | Sempre presente nas respostas de erro |

#### Exemplos

`404 NOT_FOUND`:

```json
{
  "code": "NOT_FOUND",
  "message": "Produto não encontrado.",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

`500 INTERNAL_ERROR`:

```json
{
  "code": "INTERNAL_ERROR",
  "message": "Erro interno do servidor.",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

`409 INSUFFICIENT_STOCK`:

```json
{
  "code": "INSUFFICIENT_STOCK",
  "message": "Estoque insuficiente.",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Handlers lançam `ApiError` ou deixam `ZodError` ser convertido automaticamente por `createHandler()`.

---

## Rotas públicas

Autenticação: **nenhuma**.

---

### `GET /products`

Lista produtos com paginação e busca opcional por nome.

| | |
|---|---|
| **Método** | `GET` |
| **Path** | `/products` |
| **Auth** | Não |

#### Request headers

| Header | Obrigatório | Valor |
|--------|-------------|-------|
| `Accept` | Recomendado | `application/json` |

#### Query parameters

| Param | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `limit` | integer | Não | `20` | Itens por página (max 100) |
| `cursor` | string | Não | — | Cursor de paginação |
| `name` | string | Não | — | Busca parcial por nome (case-insensitive) |
| `category` | string | Não | — | Filtro: `oculos`, `acessorios`, `maquiagem` |

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Óculos Vintage Gold",
      "description": "Armação dourada estilo anos 90, lentes de demonstração.",
      "price": 89.9,
      "quantity": 12,
      "photos": [
        "https://cdn.afro90s.com.br/products/550e8400/abc.jpg"
      ],
      "category": "oculos",
      "options": ["Dourado", "Preto"],
      "createdAt": "2025-06-23T12:00:00.000Z",
      "updatedAt": "2025-06-23T12:00:00.000Z"
    }
  ],
  "nextCursor": "eyJuYW1lIjo...",
  "hasMore": true
}
```

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `400` | `INVALID_QUERY` | `limit` inválido ou `category` desconhecida |

---

### `GET /products/{id}`

Retorna um produto por ID.

| | |
|---|---|
| **Método** | `GET` |
| **Path** | `/products/{id}` |
| **Auth** | Não |

#### Path parameters

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | ID do produto |

#### Request headers

| Header | Obrigatório | Valor |
|--------|-------------|-------|
| `Accept` | Recomendado | `application/json` |

#### Response `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Óculos Vintage Gold",
  "description": "Armação dourada estilo anos 90, lentes de demonstração.",
  "price": 89.9,
  "quantity": 12,
  "photos": ["https://cdn.afro90s.com.br/products/550e8400/abc.jpg"],
  "category": "oculos",
  "options": ["Dourado", "Preto"],
  "createdAt": "2025-06-23T12:00:00.000Z",
  "updatedAt": "2025-06-23T12:00:00.000Z"
}
```

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `404` | `NOT_FOUND` | Produto não existe |

---

### `POST /orders`

Cria pedido com status inicial `SOLICITADO`. Valida estoque (sem decrementar na v1). Dispara e-mail SES.

| | |
|---|---|
| **Método** | `POST` |
| **Path** | `/orders` |
| **Auth** | Não |

#### Request headers

| Header | Obrigatório | Valor |
|--------|-------------|-------|
| `Content-Type` | Sim | `application/json` |
| `Accept` | Recomendado | `application/json` |

#### Request body

```json
{
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 1,
      "selectedOption": "Preto"
    }
  ],
  "customer": {
    "name": "Maria Silva",
    "address": "Rua Exemplo, 123 - Centro",
    "postalCode": "01310-100",
    "tel": "11999998888"
  }
}
```

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `items` | array | Sim | Min 1 item |
| `items[].productId` | string (UUID) | Sim | Produto deve existir |
| `items[].quantity` | integer | Sim | >= 1 |
| `items[].selectedOption` | string | Condicional | Obrigatório se `product.options` não vazio; deve ∈ `product.options` |
| `customer.name` | string | Sim | Min 2 caracteres |
| `customer.address` | string | Sim | Min 5 caracteres |
| `customer.postalCode` | string | Sim | CEP |
| `customer.tel` | string | Sim | Telefone com DDD |

> **`fullPrice`:** calculado no servidor somando cada linha em centavos inteiros (`Math.round(unitPrice × 100) × quantity`), depois convertido para BRL (`/ 100`), evitando drift de ponto flutuante.

#### Response `201 Created`

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "status": "SOLICITADO",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 1,
      "unitPrice": 89.9,
      "selectedOption": "Preto"
    }
  ],
  "fullPrice": 89.9,
  "customer": {
    "name": "Maria Silva",
    "address": "Rua Exemplo, 123 - Centro",
    "postalCode": "01310-100",
    "tel": "11999998888"
  },
  "createdAt": "2025-06-23T14:30:00.000Z",
  "updatedAt": "2025-06-23T14:30:00.000Z"
}
```

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `400` | `VALIDATION_ERROR` | Body inválido |
| `400` | `INVALID_OPTION` | `selectedOption` ausente, inválido ou duplicado em `options` |
| `400` | `PRODUCT_NOT_FOUND` | `productId` inexistente |
| `409` | `INSUFFICIENT_STOCK` | Quantidade > estoque disponível |

#### Efeitos colaterais

- Persiste registro em DynamoDB (`orders`)
- Envia e-mail ao admin via SES

---

## Rotas admin

Autenticação: **Cognito JWT obrigatório**.

#### Request headers (todas as rotas admin)

| Header | Obrigatório | Valor |
|--------|-------------|-------|
| `Authorization` | Sim | `Bearer <access_token>` |
| `Accept` | Recomendado | `application/json` |

#### Erros de autenticação (`401`)

Token ausente ou inválido: respondido pelo **API Gateway** (request não chega à Lambda).

Token válido mas sem grupo `admins`: respondido pela **Lambda** (middleware task 10):

```json
{
  "code": "UNAUTHORIZED",
  "message": "Não autorizado.",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

> **HTTP API JWT authorizer:** o claim `cognito:groups` pode chegar como string `"[admins]"` (notação entre colchetes, não JSON válido). O middleware em `libs/http/src/auth.ts` (`parseCognitoGroups`) normaliza array, JSON ou `"[grupo1, grupo2]"` antes de verificar o grupo `admins`.

---

### `GET /admin/products`

Lista todos os produtos (paginada).

| | |
|---|---|
| **Método** | `GET` |
| **Path** | `/admin/products` |
| **Auth** | Cognito JWT |

#### Query parameters

| Param | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `limit` | integer | Não | `20` | Max 100 |
| `cursor` | string | Não | — | Paginação |
| `name` | string | Não | — | Busca por nome |
| `category` | string | Não | — | Filtro de categoria |

#### Response `200 OK`

Mesmo formato de `GET /products` (`PaginatedResponse<Product>`).

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `401` | `UNAUTHORIZED` | Token ausente, expirado ou sem grupo `admins` |

---

### `POST /admin/products`

Cria novo produto. **Suporta imagens via URL (string), base64 ou stream (multipart → S3).**

| | |
|---|---|
| **Método** | `POST` |
| **Path** | `/admin/products` |
| **Auth** | Cognito JWT |

#### Modo A — JSON (`application/json`)

**Request headers**

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/json` |

**Request body**

```json
{
  "name": "Óculos Vintage Gold",
  "description": "Armação dourada estilo anos 90.",
  "price": 89.9,
  "quantity": 12,
  "category": "oculos",
  "options": ["Dourado", "Preto"],
  "photos": [
    {
      "type": "url",
      "value": "https://exemplo.com/imagem-existente.jpg"
    },
    {
      "type": "base64",
      "value": "/9j/4AAQSkZJRgABAQ...",
      "filename": "oculos-frente.jpg",
      "contentType": "image/jpeg"
    }
  ]
}
```

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `name` | string | Sim | 2–120 caracteres |
| `description` | string | Não | Max 2000; default `""` |
| `price` | number | Sim | > 0 |
| `quantity` | integer | Sim | >= 0 |
| `category` | Category | Sim | enum |
| `options` | string[] | Não | Max 5; cada 1–40 chars; sem duplicatas |
| `photos` | PhotoInput[] | Não | Default `[]`; ver [upload de imagens](#upload-de-imagens-produtos) |

#### Modo B — Multipart (`multipart/form-data`)

**Request headers**

| Header | Valor |
|--------|-------|
| `Content-Type` | `multipart/form-data` |

**Form fields**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | |
| `description` | string | Não | Max 2000 |
| `price` | string/number | Sim | |
| `quantity` | string/number | Sim | |
| `category` | string | Sim | |
| `options` | string (JSON) | Não | Array JSON de strings, ex.: `["Preto","Dourado"]` |
| `photos` | string (JSON) | Não | Array JSON de `PhotoInput`; entradas `stream` referenciam campos de arquivo abaixo |
| `photo_0` | file (binary) | Condicional | Arquivo de imagem |
| `photo_1` | file (binary) | Condicional | Arquivo adicional |
| `photo_N` | file (binary) | Condicional | Até 10 arquivos |

Exemplo do campo `photos` em multipart:

```json
[
  { "type": "url", "value": "https://cdn.exemplo.com/ja-existente.jpg" },
  { "type": "stream", "fieldName": "photo_0" },
  { "type": "stream", "fieldName": "photo_1" }
]
```

#### Response `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Óculos Vintage Gold",
  "description": "Armação dourada estilo anos 90.",
  "price": 89.9,
  "quantity": 12,
  "photos": [
    "https://exemplo.com/imagem-existente.jpg",
    "https://cdn.afro90s.com.br/products/550e8400/uuid-1.jpg",
    "https://cdn.afro90s.com.br/products/550e8400/uuid-2.jpg"
  ],
  "category": "oculos",
  "options": ["Dourado", "Preto"],
  "createdAt": "2025-06-23T15:00:00.000Z",
  "updatedAt": "2025-06-23T15:00:00.000Z"
}
```

> A resposta sempre retorna `photos` como **array de strings (URLs finais)** — nunca base64.

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `400` | `VALIDATION_ERROR` | Campos inválidos |
| `400` | `INVALID_IMAGE` | MIME não suportado ou arquivo corrompido |
| `413` | `PAYLOAD_TOO_LARGE` | Imagem > 5 MB ou total > 10 MB |
| `401` | | Auth |

---

### `GET /admin/products/{id}`

Retorna produto por ID.

| | |
|---|---|
| **Método** | `GET` |
| **Path** | `/admin/products/{id}` |
| **Auth** | Cognito JWT |

#### Path parameters

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | ID do produto |

#### Response `200 OK`

Objeto `Product` completo (igual `GET /products/{id}`).

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `404` | `NOT_FOUND` | Produto não existe |
| `401` | | Auth |

---

### `PUT /admin/products/{id}`

Atualiza produto. Mesma lógica de imagens do `POST` (url, base64, stream).

| | |
|---|---|
| **Método** | `PUT` |
| **Path** | `/admin/products/{id}` |
| **Auth** | Cognito JWT |

#### Path parameters

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | ID do produto |

#### Request headers

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/json` **ou** `multipart/form-data` |

#### Request body (JSON)

```json
{
  "name": "Óculos Vintage Gold (edição)",
  "description": "Edição limitada.",
  "price": 79.9,
  "quantity": 10,
  "category": "oculos",
  "options": ["Dourado"],
  "photos": [
    { "type": "url", "value": "https://cdn.afro90s.com.br/products/550e8400/existing.jpg" },
    { "type": "base64", "value": "...", "filename": "nova-foto.jpg" }
  ]
}
```

> `photos` substitui a lista inteira. URLs não reenviadas são removidas (e arquivos S3 órfãos podem ser deletados — implementação futura).

#### Response `200 OK`

Objeto `Product` atualizado.

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `404` | `NOT_FOUND` | Produto não existe |
| `400` | `VALIDATION_ERROR` | Body inválido |
| `400` | `INVALID_IMAGE` | Imagem inválida |
| `401` | | Auth |

---

### `DELETE /admin/products/{id}`

Remove produto.

| | |
|---|---|
| **Método** | `DELETE` |
| **Path** | `/admin/products/{id}` |
| **Auth** | Cognito JWT |

#### Path parameters

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | ID do produto |

#### Request headers

| Header | Obrigatório | Valor |
|--------|-------------|-------|
| `Authorization` | Sim | `Bearer <token>` |

#### Response `204 No Content`

Sem body.

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `404` | `NOT_FOUND` | Produto não existe |
| `401` | | Auth |

---

### `PUT /admin/products/{id}/stock`

Ajusta estoque por **delta** (positivo aumenta, negativo reduz). Rota dedicada — distinta do `PUT /admin/products/{id}` que atualiza campos do produto.

| | |
|---|---|
| **Método** | `PUT` |
| **Path** | `/admin/products/{id}/stock` |
| **Auth** | Cognito JWT |

#### Path parameters

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | ID do produto |

#### Request headers

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/json` |

#### Request body

```json
{
  "delta": -2
}
```

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `delta` | integer | Sim | != 0; negativo reduz estoque |

#### Response `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 10
}
```

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `404` | `NOT_FOUND` | Produto não existe |
| `409` | `INSUFFICIENT_STOCK` | Estoque resultante seria negativo (`delta` negativo sem saldo) |
| `400` | `VALIDATION_ERROR` | `delta` = 0, body ausente ou ID inválido |
| `401` | | Auth |

**Implementação DynamoDB:** `UpdateExpression` usa `SET quantity = quantity + :delta`. Para `delta < 0`, `ConditionExpression` exige `quantity >= :minQuantity` com `:minQuantity = -delta` (DynamoDB não permite aritmética em condições).

---

### `GET /admin/orders`

Lista pedidos com filtros.

| | |
|---|---|
| **Método** | `GET` |
| **Path** | `/admin/orders` |
| **Auth** | Cognito JWT |

#### Query parameters

| Param | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `limit` | integer | Não | `20` | Max 100 |
| `cursor` | string | Não | — | Paginação |
| `status` | OrderStatus | Não | — | Filtrar por status |
| `q` | string | Não | — | Busca por **ID** (UUID completo ou prefixo ≥ 8 chars hex/hífen) ou **prefixo do nome do cliente** (case-insensitive, sem acentos). Mín. 2 caracteres. Ordenação default: `createdAt` desc |

Ao paginar com busca, repetir `q` (e `status`, se usado) junto com `cursor`:

```http
GET /admin/orders?q=maria&limit=20
GET /admin/orders?q=maria&limit=20&cursor=eyJ...
```

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "status": "SOLICITADO",
      "items": [
        { "productId": "550e8400-e29b-41d4-a716-446655440000", "quantity": 1, "unitPrice": 89.9, "selectedOption": "Preto" }
      ],
      "fullPrice": 89.9,
      "customer": {
        "name": "Maria Silva",
        "address": "Rua Exemplo, 123",
        "postalCode": "01310-100",
        "tel": "11999998888"
      },
      "createdAt": "2025-06-23T14:30:00.000Z",
      "updatedAt": "2025-06-23T14:30:00.000Z"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `400` | `INVALID_QUERY` | `status` inválido ou `q` com menos de 2 caracteres |
| `401` | | Auth |

> Campo interno `customerNameLower` é persistido no DynamoDB mas **não** retornado na resposta.

---

### `GET /admin/orders/{id}`

Retorna pedido por ID.

| | |
|---|---|
| **Método** | `GET` |
| **Path** | `/admin/orders/{id}` |
| **Auth** | Cognito JWT |

#### Path parameters

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | ID do pedido |

#### Response `200 OK`

Objeto `Order` completo.

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `404` | `NOT_FOUND` | Pedido não existe |
| `401` | | Auth |

---

### `PUT /admin/orders/{id}`

Atualiza status do pedido. Única mutação permitida neste recurso.

| | |
|---|---|
| **Método** | `PUT` |
| **Path** | `/admin/orders/{id}` |
| **Auth** | Cognito JWT |

#### Path parameters

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | ID do pedido |

#### Request headers

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/json` |

#### Request body

```json
{
  "status": "EM_ATENDIMENTO"
}
```

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `status` | OrderStatus | Sim | Transição válida (ver data-models.md) |

#### Response `200 OK`

Objeto `Order` com status atualizado.

#### Erros

| Status | `code` | Quando |
|--------|--------|--------|
| `404` | `NOT_FOUND` | Pedido não existe |
| `409` | `INVALID_STATUS_TRANSITION` | Transição não permitida |
| `400` | `VALIDATION_ERROR` | Status desconhecido ou body inválido |
| `401` | | Auth |

---

## Upload de imagens (produtos)

Aplicável a `POST /admin/products` e `PUT /admin/products/{id}`.

### Três formas de entrada (`PhotoInput`)

| `type` | Entrada | Processamento backend |
|--------|---------|----------------------|
| `url` | string URL | Usa URL diretamente em `photos[]` |
| `base64` | string base64 ou data URI | Decodifica → valida MIME → `PutObject` S3 → URL CDN |
| `stream` | arquivo multipart | Lê stream do campo → `PutObject` S3 → URL CDN |

### Fluxo base64 / stream

```
Cliente                    API Lambda                    S3 / CDN
   │── PhotoInput ──────────►│                              │
   │   (base64|stream)       │── PutObject ────────────────►│
   │                         │◄── key ──────────────────────│
   │                         │── monta URL pública          │
   │◄── Product.photos[] ────│   (ASSETS_CDN_URL + key)     │
```

### Limites (editáveis)

| Regra | Valor |
|-------|-------|
| Max tamanho por imagem | 5 MB |
| Max fotos por produto | 10 |
| MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Max payload API Gateway | 10 MB |

### Chave S3 sugerida

```
products/{productId}/{uuid}.{ext}
```

---

## Códigos HTTP e erros

| Status | Uso |
|--------|-----|
| `200` | Sucesso com body |
| `201` | Recurso criado |
| `204` | Sucesso sem body |
| `400` | Validação / query inválida |
| `401` | Auth: token ausente, inválido ou sem permissão admin |
| `404` | Recurso não encontrado |
| `409` | Conflito (estoque, transição status) |
| `413` | Payload muito grande |
| `500` | Erro interno |

### Códigos de erro (`code`)

| `code` | Descrição |
|--------|-----------|
| `VALIDATION_ERROR` | Body ou parâmetros inválidos |
| `NOT_FOUND` | Recurso não existe |
| `UNAUTHORIZED` | Auth ausente/inválida ou sem grupo `admins` |
| `FORBIDDEN` | *(reservado — não usar na v1; ver [Auth — evitar `403`](#auth--evitar-403-na-api))* |
| `INSUFFICIENT_STOCK` | Estoque insuficiente |
| `INVALID_QUERY` | Query params inválidos |
| `INVALID_CURSOR` | Cursor de paginação inválido ou incompatível com filtros |
| `INVALID_IMAGE` | Imagem inválida ou MIME não suportado |
| `PAYLOAD_TOO_LARGE` | Arquivo excede limite |
| `INVALID_STATUS_TRANSITION` | Mudança de status não permitida |
| `INVALID_OPTION` | `selectedOption` inválido ou ausente quando produto tem opções |
| `PRODUCT_NOT_FOUND` | productId inexistente no pedido |
| `INTERNAL_ERROR` | Erro não tratado |

---

## Resumo rápido

| Método | Rota | Auth | Content-Type |
|--------|------|------|--------------|
| `GET` | `/products` | — | — |
| `GET` | `/products/{id}` | — | — |
| `POST` | `/orders` | — | `application/json` |
| `GET` | `/admin/products` | JWT | — |
| `POST` | `/admin/products` | JWT | `application/json` ou `multipart/form-data` |
| `GET` | `/admin/products/{id}` | JWT | — |
| `PUT` | `/admin/products/{id}` | JWT | `application/json` ou `multipart/form-data` |
| `DELETE` | `/admin/products/{id}` | JWT | — |
| `PUT` | `/admin/products/{id}/stock` | JWT | `application/json` |
| `GET` | `/admin/orders` | JWT | — |
| `GET` | `/admin/orders/{id}` | JWT | — |
| `PUT` | `/admin/orders/{id}` | JWT | `application/json` |

## Referências

- [Modelos de dados](data-models.md)
- [Backend overview](overview.md)
- [Recursos AWS](../infra/resources.md)
