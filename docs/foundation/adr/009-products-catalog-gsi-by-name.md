# ADR-009: GSI `gsi-by-name` para listagem e busca de produtos ordenados por nome

**Status:** Proposto  
**Data:** 2026-07-03  
**Autores:** Equipe Afro90s

## Contexto

A tabela `afro90s-{env}-ddb-products` usa PK `id` (UUID). Os access patterns públicos de catálogo são:

| Pattern | v1 atual | Problema |
|---------|----------|----------|
| `GET /products` (listagem) | `Scan` em `gsi-createdAt` | Ordem **não garantida**; GSI não entrega listagem por data via `Query` |
| `GET /products?name=…` | `Scan` na tabela + `begins_with(nameLower)` | Funciona após fix do bug de `Query` inválido; **sem ordenação A→Z** |
| `GET /products/{id}` | `GetItem` por `id` | OK — não muda |

O GSI `gsi-name` (PK `nameLower`, SK `id`) foi **removido** ([handoff](../../specs/infra/handoff-remove-gsi-name.md)): o DynamoDB exige **igualdade** na partition key de `Query`; `BETWEEN`/`begins_with` na PK geravam `ValidationException` → HTTP 500.

O GSI `gsi-createdAt` (PK `createdAt`) permanece, mas o backend só faz **`Scan`** — duplica writes/storage sem benefício de `Query`, e não ordena o catálogo por nome.

**Requisito de produto:** o catálogo deve listar produtos em ordem alfabética por nome (e busca por prefixo deve respeitar essa ordem na paginação).

## Decisão

Introduzir um GSI **`gsi-by-name`** com chaves projetadas para `Query` ordenada:

| Chave | Atributo | Valor |
|-------|----------|-------|
| PK (HASH) | `entityType` | Constante `"product"` em todos os itens |
| SK (RANGE) | `catalogSortKey` | `{nameLower}#{id}` (ex.: `cat-eye retro#550e8400-…`) |

`nameLower` continua no item (normalização existente). `catalogSortKey` é **derivado** no create/update quando `name` ou `id` mudam.

### Access patterns (pós-ADR)

| Request | Operação DynamoDB |
|---------|-------------------|
| Listagem sem filtro de nome | `Query` em `gsi-by-name`: `entityType = :product`, `ScanIndexForward: true` |
| Busca por prefixo `name` | `Query`: `entityType = :product AND begins_with(catalogSortKey, :prefix)` onde `:prefix = normalizeNameLower(name)` |
| Filtro `category` | `FilterExpression` na `Query` (atributo não-chave) |
| Paginação | Cursor opaco: `index: "gsi-by-name"`, `key: { entityType, catalogSortKey }` |
| Detalhe por id | `GetItem` na tabela base (PK `id`) — inalterado |

### O que remover após migração

| Recurso | Ação |
|---------|------|
| GSI `gsi-createdAt` | **Remover** quando listagem pública migrar para `gsi-by-name` |
| `Scan` em listagens de catálogo | Substituir por `Query` em `gsi-by-name` |

`createdAt` / `updatedAt` permanecem no item para exibição e uso futuro (ex.: ordenação admin).

### Schema do item `Product` (campos novos)

```ts
entityType: "product";           // obrigatório; valor fixo
catalogSortKey: string;          // `${normalizeNameLower(name)}#${id}`
nameLower: string;               // mantido (filtros, validação, SK derivada)
```

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| Manter `Scan` + `sort()` na Lambda | Não escala; paginação inconsistente entre páginas |
| GSI PK `nameLower`, SK `id` (design antigo) | `begins_with` na PK é inválido; causou incidente prod |
| `Scan` na tabela base sem GSI (v1 pós-remoção `gsi-name`) | Aceitável em volume mínimo; **sem ordem A→Z** nem `Query` eficiente |
| OpenSearch / Algolia | Custo e operação desproporcionais para v1 |
| PK `entityType` na tabela principal | Quebraria `GetItem` por `id` ou exigiria tabela single-table complexa |

## Migração (prod)

Ordem sugerida — **sem downtime** se seguida:

1. **Infra:** adicionar GSI `gsi-by-name` (deploy CDK); manter `gsi-createdAt` temporariamente.
2. **Backend:** script one-off ou migração lazy — preencher `entityType` + `catalogSortKey` em itens existentes.
3. **Backend:** `ProductRepository.list` usa `Query` em `gsi-by-name`; deploy `products-public` (+ `products-admin` se listar).
4. **Infra:** remover `gsi-createdAt` após validação em dev/prod.
5. **Docs:** `resources.md`, `api-routes.md`, cursores de paginação.

Critérios de aceite:

- `GET /products` → itens em ordem alfabética por `nameLower`.
- `GET /products?name=cat` → subset com prefixo, mesma ordem.
- `GET /products?category=oculos` → filtro + ordem preservada.
- Paginação `cursor` estável entre páginas.
- CloudWatch sem `ValidationException` / `Scan` em rotas de listagem (métrica opcional).

Cursors v1 com `index: "primary"` ou `"gsi-createdAt"` → `400 INVALID_CURSOR` (aceitável).

## Consequências

**Positivas**

- Listagem e busca por nome com **`Query`** (RCU previsível, ordem nativa pela SK).
- Remove GSI `gsi-createdAt` e custo de write duplicado desnecessário.
- Modelo alinhado às limitações documentadas do DynamoDB.

**Negativas**

- Dois campos derivados (`nameLower`, `catalogSortKey`) — manter sincronizados no create/update/rename.
- `FilterExpression` em `category` consome RCU de itens lidos mas filtrados (aceitável em v1).
- Migração one-off em prod para itens seedados manualmente sem `entityType`.

## Fora de escopo (v2+)

- Parâmetro `sort=createdAt` no admin (novo access pattern ou GSI dedicado).
- Unicidade global de `name` (não exigido; `catalogSortKey` usa `#id` como desempate).

## Referências

- [ADR-004](004-serverless-architecture.md) — DynamoDB on-demand
- [resources.md](../../specs/infra/resources.md) — schema tabela `products`
- [api-routes.md](../../specs/backend/api-routes.md) — `GET /products`
- [handoff-remove-gsi-name.md](../../specs/infra/handoff-remove-gsi-name.md) — remoção `gsi-name`
- [DynamoDB Key condition expressions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.KeyConditionExpressions.html)
