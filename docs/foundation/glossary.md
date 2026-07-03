# Glossário — Afro90s / afro90sInfra

Termos usados neste repositório e no ecossistema Afro90s.

| Termo | Definição |
|-------|-----------|
| **Afro90s** | Projeto principal — e-commerce com temática anos 90 para público negro. |
| **afro90sInfra** | Repositório de infraestrutura (CDK) e documentação central de specs. |
| **afro90sBackend** | Monorepo da API — `resources/` (Lambdas) + `libs/` + deploy S3. |
| **afro90sFrontend** | Repositório da SPA React. |
| **afro90sInfra** | Repositório CDK (recursos AWS). |
| **Product** | Item do catálogo: nome, preço, estoque, fotos, categoria. |
| **Order** | Pedido de compra criado pelo cliente no checkout. |
| **OrderStatus** | Estado do pedido: `SOLICITADO`, `EM_ATENDIMENTO`, `AGUARDANDO_PAGAMENTO`, `EM_PREPARACAO`, `ENVIADO`, `CONCLUIDO`, `CANCELADO`. |
| **Category** | Categoria de produto: `oculos`, `acessorios`, `maquiagem`. |
| **SPA** | Single Page Application — frontend React servido via S3 + CloudFront. |
| **Authorizer** | Validação JWT no API Gateway para rotas admin (Cognito). |
| **GSI** | Global Secondary Index no DynamoDB para consultas alternativas (ex.: pedidos por status). |
| **Cursor pagination** | Paginação por token opaco (`nextCursor`); não é JWT; ver api-routes.md |
| **PhotoInput** | Formato de entrada de imagem no CRUD admin: `url`, `base64` ou `stream`. |
| **IaC** | Infrastructure as Code — infra definida em arquivos versionados (CDK). |
| **ADR** | Architecture Decision Record — documento curto que registra uma decisão, contexto e consequências. |
| **Spec** | Especificação técnica descrevendo *o que* deve existir ou se comportar. |
| **Ambiente** | Instância isolada de infra (`dev`, `production` na v1). |
| **Flow** | Nome de um package Lambda em `resources/` (ex.: `products-public`) — igual ao path S3 e SSM no deploy. |
| **Lib** | Package compartilhado em `libs/` (ex.: `@afro90s/models`). |
| **Output** | Valor exportado pela infra para consumo externo (URL, ARN, nome de tabela). |
| **Least privilege** | Princípio de conceder apenas permissões mínimas necessárias. |
| **Plan / Apply** | Ciclo IaC: `cdk diff` previewa mudanças; `cdk deploy` executa no ambiente alvo. |

## Adicionar termos

Ao introduzir conceito novo recorrente no projeto, adicione uma linha nesta tabela via PR.
