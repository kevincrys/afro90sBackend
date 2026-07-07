# Modelos de dados — Backend

**Status:** Aprovado  
**Última atualização:** 2026-07-06

## Objetivo

Definir os tipos de dados persistidos e expostos pela API. Referência para implementação em TypeScript/Zod no repo `afro90sBackend`.

## Enums

Implementação Zod em `libs/models` (`@afro90s/models`).

### Category

```typescript
type Category = 'oculos' | 'acessorios' | 'maquiagem';
```

### OrderStatus

```typescript
type OrderStatus =
  | 'SOLICITADO'
  | 'EM_ATENDIMENTO'
  | 'AGUARDANDO_PAGAMENTO'
  | 'EM_PREPARACAO'
  | 'ENVIADO'
  | 'CONCLUIDO'
  | 'CANCELADO';
```

## Product (persistido e retornado pela API)

```typescript
interface Product {
  id: string;              // UUID v4
  name: string;
  nameLower: string;       // interno (filtro de busca); não exposto em GET público
  description: string;     // texto livre; editável só no admin; max 2000 caracteres
  price: number;           // BRL decimal, ex.: 49.90
  quantity: number;        // inteiro >= 0
  photos: string[];        // URLs públicas finais (CDN/S3)
  category: Category;
  options?: string[];      // variações (ex.: cores); max 5; omitir ou [] = sem seletor
  createdAt: string;       // ISO 8601 UTC
  updatedAt: string;       // ISO 8601 UTC
}
```

### Regras — `Product`

| Campo | Regra |
|-------|-------|
| `description` | String; **0–2000** caracteres; default `""` na criação; **somente admin** altera (`POST/PUT /admin/products*`) |
| `options` | Array opcional de strings; **máx. 5** itens; cada item **1–40** caracteres, trim; **sem duplicatas** (case-insensitive); ordem preservada |
| `nameLower` | Gerado no servidor: `normalizeNameLower(name)` — lowercase + remoção de acentos (`NFD`) |
| Leitura pública | `GET /products*` retorna `description` e `options` (somente leitura); **não** retorna `nameLower` |

## PhotoInput (entrada no CRUD admin — não persistido como objeto)

Usado em `POST /admin/products` e `PUT /admin/products/{id}` para informar imagens. A API processa e persiste apenas URLs em `photos[]`.

```typescript
/** URL já hospedada — usada diretamente sem upload */
interface PhotoInputUrl {
  type: 'url';
  value: string;           // URL https://...
}

/** Imagem codificada em base64 — API faz upload para S3 */
interface PhotoInputBase64 {
  type: 'base64';
  value: string;           // base64 puro ou data URI (data:image/jpeg;base64,...)
  filename?: string;       // ex.: "foto.jpg" — usado para extensão
  contentType?: string;    // ex.: "image/jpeg" — default inferido do filename ou image/jpeg
}

/** Referência a arquivo enviado via multipart — ver api-routes.md */
interface PhotoInputStream {
  type: 'stream';
  fieldName: string;       // nome do campo no multipart, ex.: "photo_0"
}
```

```typescript
type PhotoInput = PhotoInputUrl | PhotoInputBase64 | PhotoInputStream;
```

### Comportamento de upload

| `type` | Ação da API |
|--------|-------------|
| `url` | Armazena `value` diretamente em `photos[]` |
| `base64` | Decodifica, valida MIME, faz `PutObject` no S3, armazena URL CDN resultante |
| `stream` | Lê campo multipart, faz `PutObject` no S3, armazena URL CDN resultante |

Limites sugeridos (editáveis):

- Tamanho máximo por imagem: **5 MB**
- Formatos aceitos: `image/jpeg`, `image/png`, `image/webp`
- Máximo de fotos por produto: **10**

## OrderItem

```typescript
interface OrderItem {
  productId: string;
  productName: string;       // snapshot de Product.name
  quantity: number;          // inteiro >= 1
  unitPrice: number;         // preço no momento do pedido (snapshot)
  selectedOption?: string;   // variação escolhida (ex.: cor); snapshot; ver regras abaixo
}
```

### Regras — `OrderItem.productName`

| Campo | Regra |
|-------|-------|
| Origem | Snapshot de `Product.name` no `POST /orders` |
| Request | Não enviado pelo cliente (`CreateOrderItem` inalterado) |
| Validação | 2–120 caracteres (igual `Product.name`) |
| Legado | Sempre preenchido em pedidos novos |

### Regras — `OrderItem.selectedOption`

| Situação do produto | `selectedOption` no `POST /orders` |
|---------------------|-------------------------------------|
| `options` ausente ou `[]` | Omitido |
| `options` com 1–5 valores | **Obrigatório**; deve existir em `product.options` (match exato após trim) |

Persistido no pedido como snapshot (mesmo que o catálogo mude depois).

**Merge de linhas duplicadas no request:** chave `(productId, selectedOption)` — mesma combinação soma `quantity`; combinações diferentes permanecem em linhas separadas.

## Customer

```typescript
interface Customer {
  name: string;              // letras (Unicode), espaços, apóstrofo, hífen — sem dígitos
  address: string;
  postalCode: string;        // 8 dígitos (CEP sem hífen)
  tel: string;               // 10–11 dígitos com DDD
}
```

| Campo | Regra |
|-------|-------|
| `name` | Min 2, max 200; regex `^[\p{L}\s'-]+$` (sem dígitos `0-9`) |

## Order (persistido e retornado pela API)

```typescript
interface Order {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  fullPrice: number;
  customer: Customer;
  customerNameLower?: string;  // interno (filtro de busca admin); não exposto em GET
  createdAt: string;
  updatedAt: string;
  /** Epoch segundos (TTL DynamoDB). Preenchido ao atingir status terminal. */
  expiresAt?: number;
}
```

### Regras — `Order`

| Campo | Regra |
|-------|-------|
| `customerNameLower` | Gerado no servidor ao criar pedido: `normalizeNameLower(customer.name)` — lowercase + remoção de acentos (`NFD`). Optional no schema para pedidos legados sem o campo |
| Leitura admin | `GET /admin/orders*` retorna `Order` **sem** `customerNameLower` (mapper `toPublicOrder`) |

### Valores monetários (`price`, `unitPrice`, `fullPrice`)

- Moeda BRL com **2 casas decimais** (`multipleOf(0.01)` no Zod).
- `unitPrice`: snapshot de `Product.price` no momento do pedido.
- `fullPrice`: calculado no servidor em `order.validation.ts` — **soma em centavos inteiros** para evitar imprecisão de ponto flutuante:
  1. `priceToCents(unitPrice)` → `Math.round(price * 100)`
  2. Por linha: `centavos × quantity`
  3. Soma dos centavos das linhas → `centsToMoney` (`/ 100`)
- Não usar `Number.EPSILON` nem `toFixed()` para aritmética de totais; a soma inteira em centavos é a abordagem adotada.

Retenção: ao transicionar para `CONCLUIDO` ou `CANCELADO`, o backend define `expiresAt = floor(now/1000) + 180 * 86400`. Pedidos ativos não recebem `expiresAt`.

## Tipos auxiliares de resposta

### PaginatedResponse\<T\>

```typescript
interface PaginatedResponse<T> {
  items: T[];
  /** Token opaco de continuação — não é JWT; ver api-routes.md#paginação-cursor-opaco */
  nextCursor?: string;
  hasMore: boolean;
}
```

O cliente **não decodifica** `nextCursor`: repassa o valor na query `cursor` da próxima requisição, mantendo os mesmos filtros (`name`, `category`, `status`, etc.). Detalhes em [api-routes.md — Paginação](api-routes.md#paginação-cursor-opaco).

### ApiError

```typescript
interface ApiError {
  code: ApiErrorCode;      // ex.: NOT_FOUND, VALIDATION_ERROR, INSUFFICIENT_STOCK
  message: string;         // pt-BR para clientes
  details?: Record<string, string>;
  requestId?: string;
}
```

Implementação: classe `ApiError` e tipo `ApiErrorCode` em `@afro90s/models`; helpers `throwNotFound()`, `throwValidationError()`, etc. em `@afro90s/http`.

## Transições de status (Order)

| De | Para permitido |
|----|----------------|
| `SOLICITADO` | `EM_ATENDIMENTO`, `CANCELADO` |
| `EM_ATENDIMENTO` | `AGUARDANDO_PAGAMENTO`, `CANCELADO` |
| `AGUARDANDO_PAGAMENTO` | `EM_PREPARACAO`, `CANCELADO` |
| `EM_PREPARACAO` | `ENVIADO`, `CANCELADO` |
| `ENVIADO` | `CONCLUIDO`, `CANCELADO` |
| `CONCLUIDO` | — (terminal) |
| `CANCELADO` | — (terminal) |

## Schemas Zod (`@afro90s/models`)

| Schema | Uso |
|--------|-----|
| `ProductSchema` / `CreateProductSchema` / `UpdateProductSchema` | Persistência e CRUD admin |
| `UpdateStockSchema` (`{ delta: number }`, `delta !== 0`) | `PUT /admin/products/{id}/stock` |
| `OrderSchema` / `CreateOrderSchema` | Pedido persistido e `POST /orders` |
| `OrderItemSchema` | Item persistido no pedido (`productName` snapshot — task 21) |
| `CustomerSchema` | Cliente no pedido |
| `isValidOrderStatusTransition(from, to)` | `PUT /admin/orders/{id}` |
| `@afro90s/pagination` | `encodeCursor`, `decodeCursor`, `parseLimit`, `buildPaginatedResponse` |

Validação de `selectedOption` contra `product.options` ocorre em runtime na rota `POST /orders` (task 08), não no Zod isolado.

## Referências

- [API routes](api-routes.md)
- [Recursos AWS](../infra/resources.md)
