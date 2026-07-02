# ADR-004: Arquitetura serverless (API Gateway + Lambda + DynamoDB)

**Status:** Aceito  
**Data:** 2025-06-23  
**Autores:** Equipe Afro90s

## Contexto

O Afro90s v1 é um e-commerce com tráfego inicial incerto. Precisamos de custo proporcional ao uso, escalabilidade automática e operação mínima.

## Decisão

Adotar arquitetura **totalmente serverless**:

| Camada | Serviço |
|--------|---------|
| Frontend | S3 (bucket estático) + CloudFront |
| API | API Gateway (HTTP API) + AWS Lambda (Node.js 20.x) |
| Dados | DynamoDB (on-demand billing) |
| Imagens | S3 (bucket de assets de produtos) |
| E-mail | SES |
| Auth admin | Cognito User Pool |

Handlers Lambda separados por domínio (produtos públicos, pedidos, admin).

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| ECS/Fargate | Custo fixo e operação maior para v1 |
| EC2 | Mesmo motivo; over-provisioning |
| RDS PostgreSQL | Requer VPC e gestão; DynamoDB adequado ao volume v1 |
| MongoDB Atlas | ADR-002 fixa AWS; DynamoDB nativo reduz latência e custo |

## Consequências

**Positivas**

- Escala automática sem provisionamento
- Custo baixo em períodos de pouco tráfego
- Integração nativa entre serviços AWS

**Negativas**

- Cold start em Lambda (mitigável com provisioned concurrency em prod, se necessário)
- Modelagem DynamoDB exige planejamento de access patterns
- Limite de payload API Gateway (10 MB) — relevante para upload de imagens

## Referências

- [ADR-002](002-aws-cloud-provider.md)
- [Spec recursos](../../specs/infra/resources.md)
- [API routes](../../specs/backend/api-routes.md)
