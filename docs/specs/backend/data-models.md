# Modelos de dados — Backend

**Status:** Aprovado  
**Última atualização:** 2025-06-23

## Objetivo

Definir os tipos de dados persistidos e expostos pela API. Referência para implementação em TypeScript/Zod no repo `afro90sBackend`.

## Enums

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
  price: number;           // BRL decimal, ex.: 49.90
  quantity: number;          // inteiro >= 0
  photos: string[];        // URLs públicas finais (CDN/S3)
  category: Category;
  createdAt: string;         // ISO 8601 UTC
  updatedAt: string;         // ISO 8601 UTC
}
```

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
  quantity: number;          // inteiro >= 1
  unitPrice: number;         // preço no momento do pedido (snapshot)
}
```

## Customer

```typescript
interface Customer {
  name: string;
  address: string;
  postalCode: string;        // CEP — formato livre ou 00000-000
  tel: string;               // telefone com DDD
}
```

## Order (persistido e retornado pela API)

```typescript
interface Order {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  fullPrice: number;
  customer: Customer;
  createdAt: string;
  updatedAt: string;
}
```

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
  code: string;            // ex.: NOT_FOUND, VALIDATION_ERROR, INSUFFICIENT_STOCK
  message: string;
  details?: Record<string, unknown>;
}
```

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

## Referências

- [API routes](api-routes.md)
- [Recursos AWS](../infra/resources.md)
